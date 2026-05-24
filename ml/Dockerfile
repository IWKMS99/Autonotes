FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./ml/

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV ML_PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=10s \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "ml.worker"]
