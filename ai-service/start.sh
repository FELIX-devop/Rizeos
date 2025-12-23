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

# CRITICAL: Production settings for memory efficiency
# - No reload (prevents multiple workers)
# - Single worker (prevents memory duplication)
# - Timeout settings for stability
exec /opt/venv/bin/uvicorn app.main:app \
    --host 0.0.0.0 \
    --port $PORT \
    --log-level info \
    --no-reload \
    --workers 1 \
    --timeout-keep-alive 30 \
    --timeout-graceful-shutdown 10

