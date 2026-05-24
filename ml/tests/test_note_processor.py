import base64
from unittest.mock import MagicMock

from ml.llm.exceptions import OllamaServiceError
from ml.pipeline.note_processor import NoteProcessor
from ml.schemas.events import NoteProcessingEvent

_TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


def _settings(*, enable_summary: bool = False):
    return MagicMock(
        ollama_enable_summary=enable_summary,
        ollama_multi_image_mode="sequential",
    )


def test_process_success():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "Recognized lecture text"
    ollama.chat_text.return_value = "## Summary\nKey points"

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama, settings=_settings())
    event = NoteProcessingEvent(
        note_id=10,
        bucket_name="lecture-notes",
        file_paths=["user/page1.jpg"],
    )

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.note_id == 10
    assert result.recognized_text == "Recognized lecture text"
    assert result.summary_text == "Recognized lecture text"
    s3.download_objects.assert_called_once_with("lecture-notes", ["user/page1.jpg"])
    ollama.chat_vision.assert_called_once()
    ollama.chat_text.assert_not_called()


def test_process_success_with_summary_enabled():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "Recognized lecture text"
    ollama.chat_text.return_value = "## Summary\nKey points"

    processor = NoteProcessor(
        s3_client=s3,
        ollama_client=ollama,
        settings=_settings(enable_summary=True),
    )
    event = NoteProcessingEvent(
        note_id=11,
        bucket_name="lecture-notes",
        file_paths=["user/page1.jpg"],
    )

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.summary_text == "## Summary\nKey points"
    ollama.chat_text.assert_called_once()

def test_process_summary_failure_returns_explicit_message():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "Recognized lecture text"
    ollama.chat_text.return_value = "   "

    processor = NoteProcessor(
        s3_client=s3,
        ollama_client=ollama,
        settings=_settings(enable_summary=True),
    )
    event = NoteProcessingEvent(
        note_id=15,
        bucket_name="lecture-notes",
        file_paths=["user/page1.jpg"],
    )

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.recognized_text == "Recognized lecture text"
    assert result.summary_text == "Не удалось составить конспект: ошибка суммаризации."
    assert result.summary_text != result.recognized_text


def test_process_fails_when_no_text_recognized():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "   "

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama, settings=_settings())
    event = NoteProcessingEvent(note_id=5, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "FAILED"
    assert "Не удалось распознать" in (result.error_message or "")


def test_process_fails_on_ollama_service_error():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.side_effect = OllamaServiceError("Недостаточно RAM для модели Ollama.")

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama, settings=_settings())
    event = NoteProcessingEvent(note_id=9, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "FAILED"
    assert result.error_message == "Недостаточно RAM для модели Ollama."


def test_process_fails_when_s3_missing():
    s3 = MagicMock()
    s3.download_objects.side_effect = FileNotFoundError("Object not found: k.jpg")

    processor = NoteProcessor(s3_client=s3, ollama_client=MagicMock(), settings=_settings())
    event = NoteProcessingEvent(note_id=7, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "FAILED"
    assert "not found" in (result.error_message or "").lower()


def test_process_fails_on_degenerate_ocr():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama, settings=_settings())
    event = NoteProcessingEvent(note_id=12, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "FAILED"
    assert "повторяющиеся" in (result.error_message or "").lower()
    assert ollama.chat_vision.call_count >= 2

def test_process_wraps_latex_line_without_delimiters():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = r"\\frac{a+b}{c} = d"

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama, settings=_settings())
    event = NoteProcessingEvent(note_id=13, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.recognized_text == r"\[\\frac{a+b}{c} = d\]"


def test_process_normalizes_matrix_single_slash_linebreak():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = (
        r"\begin{pmatrix}a & b \ c & d\end{pmatrix}"
    )

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama, settings=_settings())
    event = NoteProcessingEvent(note_id=14, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.recognized_text == r"\[\begin{pmatrix}a & b \\ c & d\end{pmatrix}\]"

def test_process_summary_retries_when_first_answer_copies_ocr():
    s3 = MagicMock()
    s3.download_objects.return_value = [_TINY_PNG]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "Recognized lecture text"
    ollama.chat_text.side_effect = [
        "Recognized lecture text",
        "## Ключевые идеи\n- Краткий конспект",
    ]

    processor = NoteProcessor(
        s3_client=s3,
        ollama_client=ollama,
        settings=_settings(enable_summary=True),
    )
    event = NoteProcessingEvent(
        note_id=16,
        bucket_name="lecture-notes",
        file_paths=["user/page1.jpg"],
    )

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.recognized_text == "Recognized lecture text"
    assert result.summary_text == "## Ключевые идеи\n- Краткий конспект"
    assert ollama.chat_text.call_count == 2
