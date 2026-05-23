import asyncio
import json
import logging

import aio_pika

from .model import load_model, predict
from .settings import settings

logger = logging.getLogger(__name__)
model = load_model()


async def send_result_to_queue(note_id: str | None, prediction: str) -> None:
    payload = {"noteId": note_id, "prediction": prediction}
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    async with connection:
        channel = await connection.channel()
        exchange = await channel.declare_exchange(
            settings.result_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        await exchange.publish(
            aio_pika.Message(body=json.dumps(payload).encode("utf-8")),
            routing_key=settings.result_routing_key,
        )
    logger.info("Result published to queue: %s", payload)


def build_text_from_payload(payload: dict) -> str:
    file_paths = payload.get("filePaths", [])
    bucket_name = payload.get("bucketName", "")
    return " ".join(file_paths) or bucket_name or payload.get("noteId", "")


async def handle_message(message: aio_pika.IncomingMessage) -> None:
    async with message.process():
        body = message.body.decode("utf-8")
        payload = json.loads(body)

        note_id = payload.get("noteId")
        if note_id is None:
            logger.warning("Skip message without noteId: %s", payload)
            return

        text = build_text_from_payload(payload)
        prediction = predict(model, text)
        await send_result_to_queue(note_id, prediction)


async def run_consumer() -> None:
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    async with connection:
        channel = await connection.channel()
        exchange = await channel.declare_exchange(
            settings.ml_request_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        queue = await channel.declare_queue(settings.ml_request_queue, durable=True)
        await queue.bind(exchange, routing_key=settings.ml_request_routing_key)
        await queue.consume(handle_message)
        await asyncio.Future()