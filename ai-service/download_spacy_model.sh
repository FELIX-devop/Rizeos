#!/bin/bash
# Download spaCy model with proper error handling
set -e

python -m spacy download en_core_web_sm || {
  echo "Direct download failed, trying alternative method..."
  pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl
}

