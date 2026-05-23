from __future__ import annotations

import logging
from typing import Optional

from ml.llm.ollama_client import OllamaClient
from ml.pipeline.prompts import (
    OCR_SYSTEM_PROMPT,
    OCR_USER_PROMPT,
    SUMMARY_SYSTEM_PROMPT,
    SUMMARY_USER_TEMPLATE,
)
from ml.schemas.events import NoteProcessingEvent, NoteResultDto
from ml.storage.s3_client import S3Client

logger = logging.getLogger(__name__)


class NoteProcessor:
    def __init__(
        self,
        s3_client: Optional[S3Client] = None,
        ollama_client: Optional[OllamaClient] = None,
    ) -> None:
        self._s3 = s3_client or S3Client()
        self._ollama = ollama_client or OllamaClient()

    def process(self, event: NoteProcessingEvent) -> NoteResultDto:
        note_id = event.note_id
        try:
            if not event.file_paths:
                return self._failed(note_id, "No image files provided")

            images = self._s3.download_objects(event.bucket_name, event.file_paths)
            recognized_text = self._recognize_text(images)
            if not recognized_text.strip():
                return self._failed(note_id, "No text recognized from images")

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
        except ConnectionError as exc:
            logger.error("Ollama connection error for note %s: %s", note_id, exc)
            return self._failed(note_id, str(exc))
        except Exception as exc:
            logger.exception("Unexpected error processing note %s", note_id)
            return self._failed(note_id, f"Processing error: {exc}")

    def _recognize_text(self, images: list[bytes]) -> str:
        prompt = f"{OCR_SYSTEM_PROMPT}\n\n{OCR_USER_PROMPT}"
        return self._ollama.chat_vision(prompt, images)

    def _summarize(self, recognized_text: str) -> str:
        user_prompt = SUMMARY_USER_TEMPLATE.format(recognized_text=recognized_text)
        prompt = f"{SUMMARY_SYSTEM_PROMPT}\n\n{user_prompt}"
        return self._ollama.chat_text(prompt)

    @staticmethod
    def _failed(note_id: int, error_message: str) -> NoteResultDto:
        return NoteResultDto(
            note_id=note_id,
            status="FAILED",
            error_message=error_message,
        )
