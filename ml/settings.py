from pydantic import BaseSettings, AnyHttpUrl, Field


class Settings(BaseSettings):
    rabbitmq_url: str = Field("amqp://guest:guest@rabbitmq:5672/", env="RABBITMQ_URL")
    ml_request_queue: str = Field("ml_request", env="ML_REQUEST_QUEUE")
    backend_url: AnyHttpUrl = Field("http://backend:8080/ml/result", env="BACKEND_URL")
    ml_port: int = Field(8080, env="ML_PORT")
    python_unbuffered: bool = Field(True, env="PYTHONUNBUFFERED")


settings = Settings()