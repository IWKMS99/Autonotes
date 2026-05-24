from __future__ import annotations

import logging
from typing import Optional
import boto3
from botocore.exceptions import ClientError

from ml.settings import Settings

logger = logging.getLogger(__name__)


class S3Client:
    def __init__(self, settings: Optional["Settings"] = None) -> None:
        from ml.settings import get_settings

        self._settings = settings or get_settings()
        self._client = boto3.client(
            "s3",
            endpoint_url=self._settings.minio_endpoint,
            aws_access_key_id=self._settings.minio_access_key,
            aws_secret_access_key=self._settings.minio_secret_key,
            region_name="us-east-1",
        )

    def download_objects(self, bucket: str, keys: list[str]) -> list[bytes]:
        images: list[bytes] = []
        for key in keys:
            try:
                response = self._client.get_object(Bucket=bucket, Key=key)
                images.append(response["Body"].read())
            except ClientError as exc:
                error_code = exc.response.get("Error", {}).get("Code", "")
                logger.error("Failed to download s3://%s/%s: %s", bucket, key, exc)
                if error_code in ("NoSuchKey", "404"):
                    raise FileNotFoundError(f"Object not found: {key}") from exc
                raise
        return images
