from typing import Any


def load_model() -> Any:
    # Заглушка: сюда на будущее можно подставить загрузку реальной модели
    return {"name": "dummy_model"}


def predict(model: Any, text: str) -> str:
    # Заглушка предсказания
    return f"predicted for: {text}"