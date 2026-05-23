FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/ml/
ENV PYTHONUNBUFFERED=1
ENV ML_PORT=8000
CMD ["sh", "-c", "uvicorn ml.app:app --host 0.0.0.0 --port ${ML_PORT}"]