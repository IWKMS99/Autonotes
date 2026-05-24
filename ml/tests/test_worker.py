import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from settings import settings
from worker import handle_message


def _make_message(body: bytes, headers: dict | None = None) -> MagicMock:
    message = MagicMock()
    message.body = body
    message.headers = headers
    message.ack = AsyncMock()
    message.reject = AsyncMock()
    return message


@pytest.mark.asyncio
async def test_handle_message_publishes_completed_result():
    payload = {
        "noteId": 42,
        "bucketName": "lecture-notes",
        "filePaths": ["users/1/photo.jpg"],
    }
    message = _make_message(json.dumps(payload).encode("utf-8"))
    request_exchange = AsyncMock()
    result_exchange = AsyncMock()

    await handle_message(message, request_exchange, result_exchange)

    result_exchange.publish.assert_awaited_once()
    publish_args, publish_kwargs = result_exchange.publish.await_args
    assert publish_kwargs["routing_key"] == settings.result_routing_key

    published = json.loads(publish_args[0].body.decode("utf-8"))
    assert published["noteId"] == 42
    assert published["status"] == "COMPLETED"
    assert published["recognizedText"]
    assert published["summaryText"]
    assert published["errorMessage"] is None

    message.ack.assert_awaited_once()
    request_exchange.publish.assert_not_awaited()


@pytest.mark.asyncio
async def test_handle_message_rejects_invalid_json():
    message = _make_message(b"not-json")
    request_exchange = AsyncMock()
    result_exchange = AsyncMock()

    await handle_message(message, request_exchange, result_exchange)

    result_exchange.publish.assert_not_awaited()
    message.reject.assert_awaited_once_with(requeue=False)
    message.ack.assert_not_awaited()
