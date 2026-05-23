from typing import Any

_model: Any | None = None


def load_model() -> Any:
    # Заглушка: сюда на будущее можно подставить загрузку реальной модели
    return {"name": "dummy_model"}


def get_model() -> Any:
    global _model
    if _model is None:
        _model = load_model()
    return _model


def predict(model: Any, text: str) -> str:
    # Заглушка предсказания
    return f"predicted for: {text}"