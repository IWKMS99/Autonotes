import asyncio
import json
import logging
from typing import Any

import aio_pika

from .model import get_model, predict
from .settings import settings

logger = logging.getLogger(__name__)

RETRY_HEADER = "x-retry-count"
MAX_RETRIES = 3

PROCESS_QUEUE_DLQ_ARGS = {
    "x-dead-letter-exchange": settings.ml_request_exchange,
    "x-dead-letter-routing-key": settings.ml_request_dlq_routing_key,
}


def get_retry_count(headers: dict | None) -> int:
    value = (headers or {}).get(RETRY_HEADER, 0)
    try:
        return int(value)
    except (TypeError, ValueError):
        logger.warning("Invalid %s header: %r, using 0", RETRY_HEADER, value)
        return 0


def build_success_result(note_id: int | str, prediction: str) -> dict[str, Any]:
    return {
        "noteId": note_id,
        "status": "COMPLETED",
        "recognizedText": prediction,
        "summaryText": prediction,
        "errorMessage": None,
    }


def build_failure_result(note_id: int | str, error_message: str) -> dict[str, Any]:
    return {
        "noteId": note_id,
        "status": "FAILED",
        "recognizedText": None,
        "summaryText": None,
        "errorMessage": error_message,
    }


async def publish_result(exchange: aio_pika.Exchange, result: dict[str, Any]) -> None:
    await exchange.publish(
        aio_pika.Message(body=json.dumps(result).encode("utf-8")),
        routing_key=settings.result_routing_key,
    )
    logger.info("Result published: noteId=%s status=%s", result.get("noteId"), result.get("status"))


def build_text_from_payload(payload: dict) -> str:
    file_paths = payload.get("filePaths", [])
    bucket_name = payload.get("bucketName", "")
    return " ".join(file_paths) or bucket_name or str(payload.get("noteId", ""))


async def _retry_message(
    message: aio_pika.IncomingMessage,
    request_exchange: aio_pika.Exchange,
    retry_count: int,
) -> None:
    headers = dict(message.headers or {})
    headers[RETRY_HEADER] = retry_count + 1

    await request_exchange.publish(
        aio_pika.Message(
            body=message.body,
            headers=headers,
            content_type=message.content_type,
            correlation_id=message.correlation_id,
            type=message.type,
            app_id=message.app_id,
            priority=message.priority,
            delivery_mode=message.delivery_mode,
        ),
        routing_key=settings.ml_request_routing_key,
    )
    await message.ack()


async def handle_message(
    message: aio_pika.IncomingMessage,
    request_exchange: aio_pika.Exchange,
    result_exchange: aio_pika.Exchange,
) -> None:
    note_id: int | str | None = None
    try:
        body = message.body.decode("utf-8")
        payload = json.loads(body)
        note_id = payload.get("noteId")
        if note_id is None:
            logger.warning("Reject message without noteId: %s", payload)
            await message.reject(requeue=False)
            return

        text = build_text_from_payload(payload)
        prediction = predict(get_model(), text)
        await publish_result(result_exchange, build_success_result(note_id, prediction))
        await message.ack()
    except json.JSONDecodeError as exc:
        logger.warning("Reject invalid JSON message: %s", exc)
        await message.reject(requeue=False)
    except Exception as exc:
        logger.exception("Error processing message for noteId=%s", note_id)
        retry_count = get_retry_count(message.headers)
        if retry_count < MAX_RETRIES:
            await _retry_message(message, request_exchange, retry_count)
            return

        if note_id is not None:
            try:
                await publish_result(result_exchange, build_failure_result(note_id, str(exc)))
            except Exception:
                logger.exception("Failed to publish failure result for noteId=%s", note_id)

        await message.reject(requeue=False)


async def run_consumer() -> None:
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    async with connection:
        channel = await connection.channel()
        request_exchange = await channel.declare_exchange(
            settings.ml_request_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        result_exchange = await channel.declare_exchange(
            settings.result_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        queue = await channel.declare_queue(
            settings.ml_request_queue,
            durable=True,
            arguments=PROCESS_QUEUE_DLQ_ARGS,
        )
        await queue.bind(request_exchange, routing_key=settings.ml_request_routing_key)

        async def on_message(message: aio_pika.IncomingMessage) -> None:
            await handle_message(message, request_exchange, result_exchange)

        await queue.consume(on_message)
        await asyncio.Future()
