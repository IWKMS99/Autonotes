#!/bin/sh
set -e

KIBANA_URL="http://kibana:5601"

for i in $(seq 1 60); do
  if curl -fsS "$KIBANA_URL/api/status" >/dev/null; then
    break
  fi
  sleep 2
  if [ "$i" -eq 60 ]; then
    echo "Kibana is not ready in time"
    exit 1
  fi
done

curl -fsS -X POST "$KIBANA_URL/api/data_views/data_view" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{"data_view":{"id":"autonotes-logs","name":"autonotes-logs-*","title":"autonotes-logs-*","timeFieldName":"@timestamp"}}' \
  || true

curl -fsS -X POST "$KIBANA_URL/api/saved_objects/_import?overwrite=true" \
  -H 'kbn-xsrf: true' \
  --form file=@/autonotes.ndjson \
  || true

echo "Kibana bootstrap completed"
