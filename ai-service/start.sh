#!/bin/bash
set -e

# Force output to be unbuffered so logs appear immediately
export PYTHONUNBUFFERED=1

echo "=== AI Service Startup Script ===" >&2
echo "PORT: $PORT" >&2
echo "MODEL_NAME: $MODEL_NAME" >&2
echo "SPACY_MODEL: $SPACY_MODEL" >&2
echo "Current directory: $(pwd)" >&2
echo "Python version:" >&2
python --version >&2
echo "Activating virtual environment..." >&2
source /opt/venv/bin/activate
echo "Virtual environment activated" >&2
echo "Python path: $(which python)" >&2
echo "Checking app import..." >&2
python -c "import app.main; print('✅ App import successful!')" >&2
echo "Starting uvicorn..." >&2
echo "=================================" >&2
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info

