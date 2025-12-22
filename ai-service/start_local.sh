#!/bin/bash
# Start AI service locally for testing

cd "$(dirname "$0")"
source .venv/bin/activate

echo "Starting AI Service on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

