from __future__ import annotations

import io

from PIL import Image, ImageOps

MAX_EDGE_PX = 1600
JPEG_QUALITY = 90
VLM_PATCH_SIZE = 28


def prepare_image_for_vision(image_bytes: bytes) -> bytes:
    """Normalize size/format so the vision model reads slides and handwriting better."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img = _resize_with_limit(img)
        img = _align_to_patch_grid(img)

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        return buffer.getvalue()


def prepare_image_for_vision_png(image_bytes: bytes) -> bytes:
    """PNG without JPEG artifacts - better for slides and screen photos."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img = _resize_with_limit(img)
        img = _align_to_patch_grid(img)

        buffer = io.BytesIO()
        img.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()


def prepare_images_for_vision(images: list[bytes]) -> list[bytes]:
    return [prepare_image_for_vision(data) for data in images]


def prepare_images_for_vision_png(images: list[bytes]) -> list[bytes]:
    return [prepare_image_for_vision_png(data) for data in images]


def _resize_with_limit(img: Image.Image) -> Image.Image:
    width, height = img.size
    longest = max(width, height)
    if longest <= MAX_EDGE_PX:
        return img

    scale = MAX_EDGE_PX / longest
    return img.resize(
        (max(1, int(width * scale)), max(1, int(height * scale))),
        Image.Resampling.LANCZOS,
    )


def _align_to_patch_grid(img: Image.Image) -> Image.Image:
    width, height = img.size

    aligned_width = max(VLM_PATCH_SIZE, (width // VLM_PATCH_SIZE) * VLM_PATCH_SIZE)
    aligned_height = max(VLM_PATCH_SIZE, (height // VLM_PATCH_SIZE) * VLM_PATCH_SIZE)

    if aligned_width == width and aligned_height == height:
        return img

    return img.resize((aligned_width, aligned_height), Image.Resampling.LANCZOS)
