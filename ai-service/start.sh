#!/bin/bash
set -e

echo "=== AI Service Startup Script ==="
echo "PORT: $PORT"
echo "MODEL_NAME: $MODEL_NAME"
echo "SPACY_MODEL: $SPACY_MODEL"
echo "Current directory: $(pwd)"
echo "Python version:"
python --version
echo "Activating virtual environment..."
source /opt/venv/bin/activate
echo "Virtual environment activated"
echo "Python path: $(which python)"
echo "Checking app import..."
python -c "import app.main; print('✅ App import successful!')"
echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info

