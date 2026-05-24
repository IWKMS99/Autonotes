from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # RabbitMQ
    rabbitmq_host: str = Field(default="localhost", validation_alias="RABBITMQ_HOST")
    rabbitmq_port: int = Field(default=5672, validation_alias="RABBITMQ_PORT")
    rabbitmq_user: str = Field(default="guest", validation_alias="RABBITMQ_USER")
    rabbitmq_password: str = Field(default="guest", validation_alias="RABBITMQ_PASSWORD")

    # MinIO / S3
    minio_endpoint: str = Field(default="http://localhost:9000", validation_alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(default="minioadmin", validation_alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(default="minioadmin", validation_alias="MINIO_SECRET_KEY")
    minio_bucket: str = Field(default="lecture-notes", validation_alias="MINIO_BUCKET")

    # Ollama
    ollama_base_url: str = Field(default="http://localhost:11434", validation_alias="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="qwen2.5vl:7b", validation_alias="OLLAMA_MODEL")
    ollama_timeout_sec: int = Field(default=300, validation_alias="OLLAMA_TIMEOUT_SEC")
    ollama_multi_image_mode: Literal["batch", "sequential"] = Field(
        default="sequential", validation_alias="OLLAMA_MULTI_IMAGE_MODE"
    )
    ollama_enable_summary: bool = Field(default=True, validation_alias="OLLAMA_ENABLE_SUMMARY")
    ollama_fallback_model: str = Field(
        default="qwen2.5vl:7b",
        validation_alias="OLLAMA_FALLBACK_MODEL",
    )

    # HTTP health server (background thread in worker)
    ml_port: int = Field(default=8000, validation_alias="ML_PORT")


@lru_cache
def get_settings() -> Settings:
    return Settings()
