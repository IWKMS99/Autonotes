from __future__ import annotations

import base64
import logging
from typing import Literal, Optional

import httpx
from ollama import Client

from ml.settings import Settings

logger = logging.getLogger(__name__)


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
        prompt: str,
        images: list[bytes],
        *,
        mode: Optional[Literal["batch", "sequential"]] = None,
    ) -> str:
        image_mode = mode or self._settings.ollama_multi_image_mode
        if not images:
            raise ValueError("At least one image is required for vision chat")

        if image_mode == "batch":
            return self._chat_with_images(prompt, images)

        parts: list[str] = []
        for index, image in enumerate(images, start=1):
            page_prompt = (
                f"{prompt}\n\n"
                f"Это страница {index} из {len(images)}. "
                "Верни только текст с этой страницы."
            )
            parts.append(self._chat_with_images(page_prompt, [image]))
        return "\n\n---\n\n".join(parts)

    def chat_text(self, prompt: str) -> str:
        return self._chat_with_images(prompt, images=None)

    def _chat_with_images(self, prompt: str, images: Optional[list[bytes]]) -> str:
        message: dict = {"role": "user", "content": prompt}
        if images:
            message["images"] = [base64.b64encode(img).decode("utf-8") for img in images]

        try:
            response = self._client.chat(
                model=self._settings.ollama_model,
                messages=[message],
                stream=False,
            )
        except httpx.HTTPError as exc:
            logger.error("Ollama request failed: %s", exc)
            raise ConnectionError(f"Ollama unavailable: {exc}") from exc

        content = response.message.content if response.message else ""
        return (content or "").strip()
