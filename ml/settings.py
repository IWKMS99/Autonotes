from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    rabbitmq_url: str = Field("amqp://guest:guest@rabbitmq:5672/", env="RABBITMQ_URL")
    ml_request_exchange: str = Field("notes.exchange", env="ML_REQUEST_EXCHANGE")
    ml_request_queue: str = Field("notes.process.queue", env="ML_REQUEST_QUEUE")
    ml_request_routing_key: str = Field("notes.created", env="ML_REQUEST_ROUTING_KEY")
    ml_request_dlq_routing_key: str = Field("notes.dlq", env="ML_REQUEST_DLQ_ROUTING_KEY")
    result_exchange: str = Field("notes.exchange", env="ML_RESULT_EXCHANGE")
    result_routing_key: str = Field("notes.completed", env="ML_RESULT_ROUTING_KEY")
    ml_port: int = Field(8000, env="ML_PORT")
    python_unbuffered: bool = Field(True, env="PYTHONUNBUFFERED")


settings = Settings()