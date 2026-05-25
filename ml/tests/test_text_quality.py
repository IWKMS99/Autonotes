from ml.pipeline.text_quality import is_degenerate_text, validate_ocr_text


def test_degenerate_repeated_exclamation():
    assert is_degenerate_text("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")


def test_valid_russian_text():
    assert not is_degenerate_text("Привет. Это образец для распознавания текста.")


def test_validate_unreadable_marker_without_content():
    assert validate_ocr_text("[текст неразборчив]") is not None


def test_validate_unreadable_marker_with_content_is_ok():
    text = "[текст неразборчив]\n\nПривет. Это образец для распознавания текста для статьи."
    assert validate_ocr_text(text) is None


def test_validate_ok_returns_none():
    assert validate_ocr_text("1. Первый пункт\n2. Второй пункт") is None


def test_math_heavy_text_not_rejected():
    latex = r"$X' = P^{-1} \cdot X = \begin{pmatrix} \cos \phi \end{pmatrix}$" * 3
    russian = "Линейное подпространство называется непустым подмножеством пространства."
    assert validate_ocr_text(latex + "\n" + russian) is None
