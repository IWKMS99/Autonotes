from __future__ import annotations

import base64
import logging
from typing import Literal, Optional

import httpx
from ollama import Client, ResponseError

from ml.llm.exceptions import OllamaServiceError
from ml.settings import Settings

logger = logging.getLogger(__name__)


def _map_ollama_error(exc: ResponseError) -> OllamaServiceError:
    message = str(exc).lower()
    if "system memory" in message or "requires more" in message and "memory" in message:
        return OllamaServiceError(
            "Недостаточно RAM для модели Ollama. Закройте лишние приложения, "
            "выполните `ollama stop` для выгрузки моделей или укажите меньшую модель "
            "(например qwen2.5vl:3b) в OLLAMA_MODEL."
        )
    if "not found" in message:
        return OllamaServiceError(
            "Модель Ollama не найдена. Выполните `ollama pull` для модели из OLLAMA_MODEL."
        )
    if "status code: 502" in message or "status code: 503" in message:
        return OllamaServiceError(
            "Ollama временно недоступна (перегрузка или нехватка памяти). "
            "Подождите минуту и попробуйте снова; при необходимости перезапустите Ollama."
        )
    return OllamaServiceError(f"Ошибка Ollama: {exc}")


class OllamaClient:
    def __init__(self, settings: Optional[Settings] = None) -> None:
        from ml.settings import get_settings

        self._settings = settings or get_settings()
        self._client = Client(
            host=self._settings.ollama_base_url,
            timeout=self._settings.ollama_timeout_sec,
        )

    def chat_vision(
        self,
        user_prompt: str,
        images: list[bytes],
        *,
        system_prompt: Optional[str] = None,
        mode: Optional[Literal["batch", "sequential"]] = None,
        temperature: float = 0.0,
        model: Optional[str] = None,
    ) -> str:
        image_mode = mode or self._settings.ollama_multi_image_mode
        if not images:
            raise ValueError("At least one image is required for vision chat")

        if image_mode == "batch":
            return self._chat_with_images(
                user_prompt,
                images,
                system_prompt=system_prompt,
                temperature=temperature,
                model=model,
            )

        parts: list[str] = []
        for index, image in enumerate(images, start=1):
            page_prompt = (
                f"{user_prompt}\n\n"
                f"Это страница {index} из {len(images)}. "
                "Верни только текст с этой страницы."
            )
            parts.append(
                self._chat_with_images(
                    page_prompt,
                    [image],
                    system_prompt=system_prompt,
                    temperature=temperature,
                    model=model,
                )
            )
        return "\n\n---\n\n".join(parts)

    def chat_text(
        self,
        user_prompt: str,
        *,
        system_prompt: Optional[str] = None,
        temperature: float = 0.0,
    ) -> str:
        return self._chat_with_images(
            user_prompt,
            images=None,
            system_prompt=system_prompt,
            temperature=temperature,
        )

    def _chat_with_images(
        self,
        user_prompt: str,
        images: Optional[list[bytes]],
        *,
        system_prompt: Optional[str] = None,
        temperature: float = 0.0,
        model: Optional[str] = None,
    ) -> str:
        messages: list[dict] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        user_message: dict = {"role": "user", "content": user_prompt}
        if images:
            user_message["images"] = [base64.b64encode(img).decode("utf-8") for img in images]
        messages.append(user_message)

        try:
            response = self._client.chat(
                model=model or self._settings.ollama_model,
                messages=messages,
                stream=False,
                options={
                    "temperature": temperature,
                    "num_predict": 4096,
                },
            )
        except ResponseError as exc:
            logger.error("Ollama API error: %s", exc)
            raise _map_ollama_error(exc) from exc
        except httpx.HTTPError as exc:
            logger.error("Ollama request failed: %s", exc)
            raise ConnectionError(f"Ollama unavailable: {exc}") from exc

        content = response.message.content if response.message else ""
        return (content or "").strip()
