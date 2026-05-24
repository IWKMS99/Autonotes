from __future__ import annotations

import json
import logging
from typing import Optional

import pika
from pika.adapters.blocking_connection import BlockingChannel
from pydantic import ValidationError

from ml.messaging.constants import EXCHANGE_NOTES, QUEUE_NOTES_PROCESS, ROUTING_KEY_PROCESS
from ml.messaging.publisher import ResultPublisher
from ml.pipeline.note_processor import NoteProcessor
from ml.schemas.events import NoteProcessingEvent, NoteResultDto
from ml.settings import Settings

logger = logging.getLogger(__name__)


class NoteProcessConsumer:
    def __init__(
        self,
        processor: Optional[NoteProcessor] = None,
        settings: Optional[Settings] = None,
    ) -> None:
        from ml.settings import get_settings

        self._processor = processor or NoteProcessor()
        self._settings = settings or get_settings()
        self._connection: Optional[pika.BlockingConnection] = None
        self._channel: Optional[BlockingChannel] = None
        self._publisher: Optional[ResultPublisher] = None

    def start(self) -> None:
        parameters = pika.ConnectionParameters(
            host=self._settings.rabbitmq_host,
            port=self._settings.rabbitmq_port,
            credentials=pika.PlainCredentials(
                self._settings.rabbitmq_user,
                self._settings.rabbitmq_password,
            ),
        )
        self._connection = pika.BlockingConnection(parameters)
        self._channel = self._connection.channel()
        self._publisher = ResultPublisher(self._channel, self._settings)

        self._channel.exchange_declare(
            exchange=EXCHANGE_NOTES,
            exchange_type="topic",
            durable=True,
        )
        # Queue topology (DLX args) is declared by the Spring backend.
        self._channel.queue_declare(queue=QUEUE_NOTES_PROCESS, passive=True)
        self._channel.queue_bind(
            exchange=EXCHANGE_NOTES,
            queue=QUEUE_NOTES_PROCESS,
            routing_key=ROUTING_KEY_PROCESS,
        )
        self._channel.basic_qos(prefetch_count=1)
        self._channel.basic_consume(
            queue=QUEUE_NOTES_PROCESS,
            on_message_callback=self._on_message,
            auto_ack=False,
        )

        logger.info("Listening on queue %s", QUEUE_NOTES_PROCESS)
        self._channel.start_consuming()

    def stop(self) -> None:
        if self._channel and self._channel.is_open:
            self._channel.stop_consuming()
        if self._connection and self._connection.is_open:
            self._connection.close()

    def _on_message(
        self,
        channel: BlockingChannel,
        method: pika.spec.Basic.Deliver,
        properties: pika.BasicProperties,
        body: bytes,
    ) -> None:
        delivery_tag = method.delivery_tag
        try:
            event = self._parse_event(body)
            result = self._processor.process(event)
            self._publisher.publish(result)
            channel.basic_ack(delivery_tag=delivery_tag)
        except ValidationError as exc:
            logger.error("Invalid message payload, rejecting to DLQ: %s", exc)
            channel.basic_nack(delivery_tag=delivery_tag, requeue=False)
        except Exception as exc:
            logger.exception("Failed to handle message: %s", exc)
            self._publish_failure_safe(body, str(exc))
            channel.basic_ack(delivery_tag=delivery_tag)

    def _parse_event(self, body: bytes) -> NoteProcessingEvent:
        payload = json.loads(body.decode("utf-8"))
        return NoteProcessingEvent.model_validate(payload)

    def _publish_failure_safe(self, body: bytes, error_message: str) -> None:
        try:
            event = self._parse_event(body)
            note_id = event.note_id
        except Exception:
            logger.error("Cannot determine noteId for failure result, skipping publish")
            return

        result = NoteResultDto(
            note_id=note_id,
            status="FAILED",
            error_message=error_message,
        )
        self._publisher.publish(result)
