import logging
import signal
import sys
import threading

import uvicorn

from ml.app import app
from ml.messaging.consumer import NoteProcessConsumer
from ml.settings import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def _start_health_server(port: int) -> threading.Thread:
    config = uvicorn.Config(app, host="0.0.0.0", port=port, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, name="health-server", daemon=True)
    thread.start()
    return thread


def main() -> None:
    settings = get_settings()
    _start_health_server(settings.ml_port)

    consumer = NoteProcessConsumer()

    def shutdown_handler(signum, frame) -> None:
        logger.info("Shutdown signal received (%s)", signum)
        consumer.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    logger.info(
        "ML worker started (Ollama=%s, model=%s, health port=%s)",
        settings.ollama_base_url,
        settings.ollama_model,
        settings.ml_port,
    )
    consumer.start()


if __name__ == "__main__":
    main()