from __future__ import annotations

import logging
from typing import Optional, Tuple

import pika
from pika.adapters.blocking_connection import BlockingChannel

from ml.messaging.constants import EXCHANGE_NOTES, ROUTING_KEY_RESULTS
from ml.schemas.events import NoteResultDto
from ml.settings import Settings

logger = logging.getLogger(__name__)


class ResultPublisher:
    def __init__(self, channel: BlockingChannel, settings: Optional[Settings] = None) -> None:
        from ml.settings import get_settings

        self._channel = channel
        self._settings = settings or get_settings()
        self._channel.exchange_declare(
            exchange=EXCHANGE_NOTES,
            exchange_type="topic",
            durable=True,
        )

    @classmethod
    def connect(cls, settings: Optional[Settings] = None) -> Tuple[pika.BlockingConnection, "ResultPublisher"]:
        from ml.settings import get_settings

        cfg = settings or get_settings()
        parameters = pika.ConnectionParameters(
            host=cfg.rabbitmq_host,
            port=cfg.rabbitmq_port,
            credentials=pika.PlainCredentials(cfg.rabbitmq_user, cfg.rabbitmq_password),
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        return connection, cls(channel, cfg)

    def publish(self, result: NoteResultDto) -> None:
        body = result.model_dump_json_for_rabbit()
        self._channel.basic_publish(
            exchange=EXCHANGE_NOTES,
            routing_key=ROUTING_KEY_RESULTS,
            body=body.encode("utf-8"),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,
            ),
        )
        logger.info("Published result for noteId=%s status=%s", result.note_id, result.status)
