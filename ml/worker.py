import asyncio
import json
import logging

import aio_pika
import httpx

from .model import load_model, predict
from .settings import settings

logger = logging.getLogger(__name__)
model = load_model()


async def send_result_to_backend(request_id: str | None, prediction: str) -> None:
    payload = {"id": request_id, "prediction": prediction}
    async with httpx.AsyncClient() as client:
        response = await client.post(settings.backend_url, json=payload, timeout=10.0)
        response.raise_for_status()
        logger.info("Result sent to backend: %s", payload)


async def handle_message(message: aio_pika.IncomingMessage) -> None:
    async with message.process():
        body = message.body.decode("utf-8")
        payload = json.loads(body)
        request_id = payload.get("id")
        text = payload.get("text", "")
        prediction = predict(model, text)
        await send_result_to_backend(request_id, prediction)


async def run_consumer() -> None:
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    async with connection:
        channel = await connection.channel()
        queue = await channel.declare_queue(settings.ml_request_queue, durable=True)
        await queue.consume(handle_message)
        await asyncio.Future()