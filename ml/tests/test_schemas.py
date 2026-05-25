import json

from ml.schemas.events import NoteProcessingEvent, NoteResultDto


def test_note_processing_event_from_camel_case_json():
    payload = {
        "noteId": 42,
        "bucketName": "lecture-notes",
        "filePaths": ["user/photo1.jpg", "user/photo2.jpg"],
    }
    event = NoteProcessingEvent.model_validate(payload)
    assert event.note_id == 42
    assert event.bucket_name == "lecture-notes"
    assert event.file_paths == ["user/photo1.jpg", "user/photo2.jpg"]


def test_note_result_dto_serializes_camel_case():
    result = NoteResultDto(
        note_id=1,
        status="COMPLETED",
        recognized_text="# Title",
        summary_text="Summary",
    )
    data = json.loads(result.model_dump_json_for_rabbit())
    assert data["noteId"] == 1
    assert data["status"] == "COMPLETED"
    assert data["recognizedText"] == "# Title"
    assert data["summaryText"] == "Summary"
    assert data["errorMessage"] is None
