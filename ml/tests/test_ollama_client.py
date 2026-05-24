from unittest.mock import MagicMock, patch

from ollama import ResponseError

from ml.llm.ollama_client import OllamaClient, _map_ollama_error


def test_map_ollama_error_memory():
    exc = ResponseError("model requires more system memory (4.7 GiB) than is available (4.5 GiB)")
    mapped = _map_ollama_error(exc)
    assert "RAM" in str(mapped)
    assert "qwen2.5vl:3b" in str(mapped)


def test_map_ollama_error_model_not_found():
    exc = ResponseError("model 'missing' not found")
    mapped = _map_ollama_error(exc)
    assert "не найдена" in str(mapped).lower() or "ollama pull" in str(mapped).lower()


def test_chat_wraps_response_error():
    client = OllamaClient(settings=MagicMock(ollama_model="test", ollama_base_url="http://localhost:11434", ollama_timeout_sec=30, ollama_multi_image_mode="batch"))
    with patch.object(client._client, "chat", side_effect=ResponseError("model requires more system memory")):
        try:
            client.chat_text("hi")
            assert False, "expected OllamaServiceError"
        except Exception as exc:
            from ml.llm.exceptions import OllamaServiceError

            assert isinstance(exc, OllamaServiceError)
