from __future__ import annotations

import re
from collections import Counter

_MIN_CYRILLIC_LETTERS = 8
_MIN_TEXT_LENGTH = 15


def count_letters(text: str) -> int:
    return sum(1 for ch in text if ch.isalpha())


def count_cyrillic_letters(text: str) -> int:
    return sum(1 for ch in text if "\u0400" <= ch <= "\u04FF")


def is_degenerate_text(text: str) -> bool:
    """Only obvious garbage: long runs of the same non-word character (!!!!!)."""
    compact = re.sub(r"\s+", "", text)
    if len(compact) < 10:
        return False

    counter = Counter(compact)
    char, top_count = counter.most_common(1)[0]
    ratio = top_count / len(compact)
    if ratio < 0.85:
        return False

    if char.isalnum():
        return False

    return char in "!?*#_.-=~`^" or not char.isalnum()


def strip_unreadable_marker(text: str) -> str:
    return re.sub(r"\[?\s*текст\s+неразборчив\s*\]?", "", text, flags=re.IGNORECASE).strip()


def has_minimal_readable_content(text: str) -> bool:
    stripped = strip_unreadable_marker(text)
    if len(stripped) < _MIN_TEXT_LENGTH:
        return False
    if count_cyrillic_letters(stripped) >= _MIN_CYRILLIC_LETTERS:
        return True
    if count_letters(stripped) >= _MIN_CYRILLIC_LETTERS:
        return True
    return False


def validate_ocr_text(text: str) -> str | None:
    """Return user-facing error when OCR output is unusable."""
    stripped = text.strip()
    if not stripped:
        return "Не удалось распознать текст на изображении."

    if is_degenerate_text(stripped):
        return (
            "Модель вернула некорректный результат (повторяющиеся символы). "
            "Попробуйте переснять фото или модель qwen2.5vl:7b при достаточной RAM."
        )

    if "[текст неразборчив]" in stripped.lower() and not has_minimal_readable_content(stripped):
        return (
            "Текст на фото не удалось прочитать. Сделайте снимок чётче, "
            "без бликов и при хорошем освещении."
        )

    if not has_minimal_readable_content(stripped):
        return "Слишком мало распознанного текста. Попробуйте более чёткое фото крупным планом."

    return None
