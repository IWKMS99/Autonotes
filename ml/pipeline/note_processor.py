from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Callable, Literal, Optional

from ml.llm.exceptions import OllamaServiceError
from ml.llm.ollama_client import OllamaClient
from ml.pipeline.image_prep import (
    prepare_images_for_vision,
    prepare_images_for_vision_png,
)
from ml.pipeline.prompts import (
    OCR_PLAIN_USER_PROMPT,
    OCR_RETRY_USER_PROMPT,
    OCR_SYSTEM_PROMPT,
    OCR_USER_PROMPT,
    SUMMARY_RETRY_USER_TEMPLATE,
    SUMMARY_SYSTEM_PROMPT,
    SUMMARY_USER_TEMPLATE,
)
from ml.pipeline.text_quality import is_degenerate_text, validate_ocr_text
from ml.schemas.events import NoteProcessingEvent, NoteResultDto
from ml.settings import Settings
from ml.storage.s3_client import S3Client

logger = logging.getLogger(__name__)
_SUMMARY_FALLBACK_MESSAGE = "Не удалось составить конспект: ошибка суммаризации."

_LATEX_SIGNAL_RE = re.compile(
    r"(\\(frac|sqrt|sum|int|lim|cdot|times|alpha|beta|gamma|delta|theta|pi|sin|cos|tan|log|ln)\b|\\begin\{[^}]+\}|\\end\{[^}]+\}|[A-Za-z0-9]\s*=\s*[A-Za-z0-9\\]|[A-Za-z0-9]\s*[\^_]\s*\{[^}]+\})"
)
_MATRIX_ENV_RE = re.compile(
    r"\\begin\{(?P<env>pmatrix|bmatrix|matrix|vmatrix|Vmatrix)\}(?P<body>.*?)\\end\{(?P=env)\}",
    flags=re.DOTALL,
)


@dataclass(frozen=True)
class _OcrAttempt:
    prepare: Callable[[list[bytes]], list[bytes]]
    user_prompt: str
    system_prompt: Optional[str]
    temperature: float
    model: Optional[str] = None


class NoteProcessor:
    def __init__(
        self,
        s3_client: Optional[S3Client] = None,
        ollama_client: Optional[OllamaClient] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        from ml.settings import get_settings

        self._settings = settings or get_settings()
        self._s3 = s3_client or S3Client(self._settings)
        self._ollama = ollama_client or OllamaClient(self._settings)

    def process(self, event: NoteProcessingEvent) -> NoteResultDto:
        note_id = event.note_id
        try:
            if not event.file_paths:
                return self._failed(note_id, "No image files provided")

            raw_images = self._s3.download_objects(event.bucket_name, event.file_paths)
            recognized_text, ocr_error = self._recognize_text_with_fallbacks(raw_images, note_id)
            if ocr_error:
                return self._failed(note_id, ocr_error)

            summary_text = self._summarize(recognized_text)
            if not summary_text.strip():
                return self._failed(note_id, "Failed to generate summary")

            return NoteResultDto(
                note_id=note_id,
                status="COMPLETED",
                recognized_text=recognized_text,
                summary_text=summary_text,
            )
        except FileNotFoundError as exc:
            logger.error("S3 file not found for note %s: %s", note_id, exc)
            return self._failed(note_id, str(exc))
        except OllamaServiceError as exc:
            logger.error("Ollama service error for note %s: %s", note_id, exc)
            return self._failed(note_id, str(exc))
        except ConnectionError as exc:
            logger.error("Ollama connection error for note %s: %s", note_id, exc)
            return self._failed(note_id, str(exc))
        except Exception as exc:
            logger.exception("Unexpected error processing note %s", note_id)
            return self._failed(note_id, f"Processing error: {exc}")

    def _ocr_attempts(self) -> list[_OcrAttempt]:
        primary = self._settings.ollama_model
        fallback = self._settings.ollama_fallback_model
        attempts = [
            _OcrAttempt(prepare_images_for_vision, OCR_USER_PROMPT, OCR_SYSTEM_PROMPT, 0.0, primary),
            _OcrAttempt(prepare_images_for_vision_png, OCR_RETRY_USER_PROMPT, OCR_SYSTEM_PROMPT, 0.0, primary),
            _OcrAttempt(prepare_images_for_vision_png, OCR_PLAIN_USER_PROMPT, None, 0.1, primary),
        ]
        if fallback and fallback != primary:
            attempts.extend(
                [
                    _OcrAttempt(prepare_images_for_vision, OCR_USER_PROMPT, OCR_SYSTEM_PROMPT, 0.0, fallback),
                    _OcrAttempt(
                        prepare_images_for_vision_png,
                        OCR_RETRY_USER_PROMPT,
                        OCR_SYSTEM_PROMPT,
                        0.0,
                        fallback,
                    ),
                    _OcrAttempt(prepare_images_for_vision_png, OCR_PLAIN_USER_PROMPT, None, 0.1, fallback),
                ]
            )
        return attempts

    def _recognize_text_with_fallbacks(
        self,
        raw_images: list[bytes],
        note_id: int,
    ) -> tuple[str, Optional[str]]:
        last_text = ""
        last_error: Optional[str] = None

        for index, attempt in enumerate(self._ocr_attempts(), start=1):
            images = attempt.prepare(raw_images)
            try:
                text = self._run_vision_ocr(
                    images,
                    user_prompt=attempt.user_prompt,
                    system_prompt=attempt.system_prompt,
                    temperature=attempt.temperature,
                    model=attempt.model,
                )
            except OllamaServiceError as exc:
                logger.warning("OCR attempt %s for note %s: %s", index, note_id, exc)
                last_error = str(exc)
                continue

            text = self._ensure_math_delimiters(text)
            last_text = text
            ocr_error = validate_ocr_text(text)
            if ocr_error is None:
                if index > 1:
                    logger.info("OCR succeeded for note %s on attempt %s", note_id, index)
                return text, None

            logger.warning(
                "OCR attempt %s for note %s failed (%s). preview=%r",
                index,
                note_id,
                ocr_error,
                text[:200],
            )
            last_error = ocr_error

        if last_text.strip() and validate_ocr_text(last_text) is None:
            return last_text, None

        return last_text, last_error or (
            "Не удалось распознать текст. Попробуйте другое фото или модель qwen2.5vl:7b."
        )

    def _run_vision_ocr(
        self,
        images: list[bytes],
        *,
        user_prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        model: Optional[str],
    ) -> str:
        mode: Literal["batch", "sequential"] = (
            "sequential" if len(images) == 1 else self._settings.ollama_multi_image_mode
        )
        return self._ollama.chat_vision(
            user_prompt,
            images,
            system_prompt=system_prompt,
            mode=mode,
            temperature=temperature,
            model=model,
        )

    def _summarize(self, recognized_text: str) -> str:
        if not self._settings.ollama_enable_summary:
            return recognized_text

        try:
            user_prompt = SUMMARY_USER_TEMPLATE.format(recognized_text=recognized_text)
            summary = self._ensure_math_delimiters(
                self._ollama.chat_text(
                    user_prompt,
                    system_prompt=SUMMARY_SYSTEM_PROMPT,
                    temperature=0.0,
                )
            )

            if self._looks_like_copied_ocr(summary, recognized_text):
                retry_prompt = SUMMARY_RETRY_USER_TEMPLATE.format(recognized_text=recognized_text)
                summary = self._ensure_math_delimiters(
                    self._ollama.chat_text(
                        retry_prompt,
                        system_prompt=SUMMARY_SYSTEM_PROMPT,
                        temperature=0.0,
                    )
                )
        except (OllamaServiceError, ConnectionError) as exc:
            logger.warning("Summary generation failed: %s", exc)
            return _SUMMARY_FALLBACK_MESSAGE

        if validate_ocr_text(summary) or self._looks_like_copied_ocr(summary, recognized_text):
            return _SUMMARY_FALLBACK_MESSAGE
        return summary

    @staticmethod
    def _looks_like_copied_ocr(summary: str, recognized_text: str) -> bool:
        if not summary.strip() or not recognized_text.strip():
            return False

        normalized_summary = re.sub(r"\s+", " ", summary.lower()).strip()
        normalized_recognized = re.sub(r"\s+", " ", recognized_text.lower()).strip()
        if normalized_summary == normalized_recognized:
            return True

        return (
            normalized_summary in normalized_recognized
            and len(normalized_summary) / max(len(normalized_recognized), 1) > 0.85
        )

    @staticmethod
    def _ensure_math_delimiters(text: str) -> str:
        lines = text.splitlines()
        normalized: list[str] = []
        in_code_block = False

        for raw_line in lines:
            line = raw_line.rstrip()
            stripped = line.strip()

            if stripped.startswith("```"):
                in_code_block = not in_code_block
                normalized.append(raw_line)
                continue

            if (
                in_code_block
                or not stripped
                or "$" in stripped
                or not _LATEX_SIGNAL_RE.search(stripped)
            ):
                normalized.append(raw_line)
                continue

            normalized.append(f"\\[{stripped}\\]")

        return NoteProcessor._normalize_matrix_linebreaks("\n".join(normalized))

    @staticmethod
    def _normalize_matrix_linebreaks(text: str) -> str:
        def _fix_match(match: re.Match[str]) -> str:
            env = match.group("env")
            body = match.group("body")
            # In matrix environments, a lone "\" is usually intended as row break ("\\").
            body = re.sub(r"(?<!\\)\\(?![\\A-Za-z])", r"\\\\", body)
            return f"\\begin{{{env}}}{body}\\end{{{env}}}"

        return _MATRIX_ENV_RE.sub(_fix_match, text)

    @staticmethod
    def _failed(note_id: int, error_message: str) -> NoteResultDto:
        return NoteResultDto(
            note_id=note_id,
            status="FAILED",
            error_message=error_message,
        )
