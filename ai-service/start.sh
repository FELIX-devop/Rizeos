#!/bin/bash
set -e

# Force unbuffered output
export PYTHONUNBUFFERED=1

# Print startup info to stderr (Railway captures this)
echo "=== AI Service Starting ===" >&2
echo "PORT: $PORT" >&2
echo "Working directory: $(pwd)" >&2
echo "Python: $(python --version 2>&1)" >&2
echo "Uvicorn path: $(which uvicorn 2>&1 || echo '/opt/venv/bin/uvicorn')" >&2
echo "Starting uvicorn..." >&2

# Start uvicorn
exec /opt/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $PORT

