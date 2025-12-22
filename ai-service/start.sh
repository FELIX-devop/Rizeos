#!/bin/bash
set -e

# Force unbuffered output
export PYTHONUNBUFFERED=1

# Print startup info (both stdout and stderr)
echo "=== AI Service Starting ==="
echo "PORT: $PORT"
echo "Working directory: $(pwd)"
echo "Python: $(/opt/venv/bin/python --version)"
echo "Uvicorn: $(ls -la /opt/venv/bin/uvicorn)"
echo "Starting uvicorn server..."

# Start uvicorn (this will output to stdout/stderr which Railway captures)
exec /opt/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info

