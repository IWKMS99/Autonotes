import json
from unittest.mock import MagicMock

from ml.messaging.constants import EXCHANGE_NOTES, ROUTING_KEY_RESULTS
from ml.messaging.publisher import ResultPublisher
from ml.schemas.events import NoteResultDto


def test_publish_sends_camel_case_json():
    channel = MagicMock()
    publisher = ResultPublisher(channel)

    result = NoteResultDto(
        note_id=99,
        status="COMPLETED",
        recognized_text="text",
        summary_text="summary",
    )
    publisher.publish(result)

    channel.basic_publish.assert_called_once()
    kwargs = channel.basic_publish.call_args.kwargs
    assert kwargs["exchange"] == EXCHANGE_NOTES
    assert kwargs["routing_key"] == ROUTING_KEY_RESULTS

    body = json.loads(kwargs["body"].decode("utf-8"))
    assert body["noteId"] == 99
    assert body["recognizedText"] == "text"
    assert body["summaryText"] == "summary"
