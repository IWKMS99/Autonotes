from __future__ import annotations

import io

from PIL import Image, ImageOps

MAX_EDGE_PX = 1600
JPEG_QUALITY = 90


def prepare_image_for_vision(image_bytes: bytes) -> bytes:
    """Normalize size/format so the vision model reads slides and handwriting better."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")

        width, height = img.size
        longest = max(width, height)
        if longest > MAX_EDGE_PX:
            scale = MAX_EDGE_PX / longest
            img = img.resize(
                (int(width * scale), int(height * scale)),
                Image.Resampling.LANCZOS,
            )

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return buffer.getvalue()


def prepare_image_for_vision_png(image_bytes: bytes) -> bytes:
    """PNG without JPEG artifacts — better for slides and screen photos."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")

        width, height = img.size
        longest = max(width, height)
        if longest > MAX_EDGE_PX:
            scale = MAX_EDGE_PX / longest
            img = img.resize(
                (int(width * scale), int(height * scale)),
                Image.Resampling.LANCZOS,
            )

        buffer = io.BytesIO()
        img.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()


def prepare_images_for_vision(images: list[bytes]) -> list[bytes]:
    return [prepare_image_for_vision(data) for data in images]


def prepare_images_for_vision_png(images: list[bytes]) -> list[bytes]:
    return [prepare_image_for_vision_png(data) for data in images]
