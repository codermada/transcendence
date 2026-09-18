#!/bin/sh

minio server /data --console-address ":9001" &
MINIO_PID=$!

sleep 3

if [ -n "$MINIO_ROOT_USER" ] && [ -n "$MINIO_ROOT_PASSWORD" ]; then
  mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"
  mc mb --ignore-existing local/uploads
  mc anonymous set download local/uploads
fi

wait $MINIO_PID