from unittest.mock import MagicMock

from ml.pipeline.note_processor import NoteProcessor
from ml.schemas.events import NoteProcessingEvent


def test_process_success():
    s3 = MagicMock()
    s3.download_objects.return_value = [b"image-bytes"]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "Recognized lecture text"
    ollama.chat_text.return_value = "## Summary\nKey points"

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama)
    event = NoteProcessingEvent(
        note_id=10,
        bucket_name="lecture-notes",
        file_paths=["user/page1.jpg"],
    )

    result = processor.process(event)

    assert result.status == "COMPLETED"
    assert result.note_id == 10
    assert result.recognized_text == "Recognized lecture text"
    assert result.summary_text == "## Summary\nKey points"
    s3.download_objects.assert_called_once_with("lecture-notes", ["user/page1.jpg"])
    ollama.chat_vision.assert_called_once()
    ollama.chat_text.assert_called_once()


def test_process_fails_when_no_text_recognized():
    s3 = MagicMock()
    s3.download_objects.return_value = [b"image-bytes"]

    ollama = MagicMock()
    ollama.chat_vision.return_value = "   "

    processor = NoteProcessor(s3_client=s3, ollama_client=ollama)
    event = NoteProcessingEvent(note_id=5, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "FAILED"
    assert "No text recognized" in (result.error_message or "")


def test_process_fails_when_s3_missing():
    s3 = MagicMock()
    s3.download_objects.side_effect = FileNotFoundError("Object not found: k.jpg")

    processor = NoteProcessor(s3_client=s3, ollama_client=MagicMock())
    event = NoteProcessingEvent(note_id=7, bucket_name="b", file_paths=["k.jpg"])

    result = processor.process(event)

    assert result.status == "FAILED"
    assert "not found" in (result.error_message or "").lower()
