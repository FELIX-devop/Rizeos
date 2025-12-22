#!/bin/bash
set -e

echo "=== Testing AI Service Locally ==="
echo ""

cd "$(dirname "$0")"
source .venv/bin/activate

echo "1. Testing app import..."
python -c "import app.main; print('✅ App import successful')"
echo ""

echo "2. Testing dependencies..."
python -c "import fastapi, uvicorn, spacy, sentence_transformers; print('✅ All dependencies available')"
echo ""

echo "3. Testing spaCy model..."
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('✅ spaCy model loaded')"
echo ""

echo "4. Testing FastAPI app creation..."
python -c "from app.main import app; print('✅ FastAPI app created successfully')"
echo ""

echo "=== All Local Tests Passed ==="
echo ""
echo "To start the service:"
echo "  source .venv/bin/activate"
echo "  uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo ""

