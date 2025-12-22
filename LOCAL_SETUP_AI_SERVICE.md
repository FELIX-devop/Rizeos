# Local AI Service Setup Guide

## Problem
Service not starting locally - `ModuleNotFoundError: No module named 'numpy'`

## Solution: Proper Local Setup

### Step 1: Navigate to AI Service Directory
```bash
cd ai-service
```

### Step 2: Create Virtual Environment
```bash
python3 -m venv venv
```

### Step 3: Activate Virtual Environment
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 4: Upgrade Pip
```bash
pip install --upgrade pip
```

### Step 5: Install Dependencies
```bash
pip install -r requirements.txt
```

**This will take 5-10 minutes** (downloads large ML libraries like torch, transformers, etc.)

### Step 6: Install spaCy Model
```bash
python -m spacy download en_core_web_sm
```

### Step 7: Verify Installation
```bash
python -c "import app.main; print('Import successful!')"
```

### Step 8: Start the Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes.

---

## Complete Setup Script

Create a file `setup_local.sh`:

```bash
#!/bin/bash
set -e

echo "=== Setting up AI Service Locally ==="

# Create venv
echo "Creating virtual environment..."
python3 -m venv venv

# Activate venv
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies (this may take 5-10 minutes)..."
pip install -r requirements.txt

# Download spaCy model
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Verify
echo "Verifying installation..."
python -c "import app.main; print('✅ Import successful!')"

echo ""
echo "=== Setup Complete ==="
echo "To start the service, run:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
```

Make it executable:
```bash
chmod +x setup_local.sh
./setup_local.sh
```

---

## Troubleshooting

### Issue: "ModuleNotFoundError"
**Cause:** Dependencies not installed or wrong Python interpreter

**Fix:**
1. Ensure venv is activated: `source venv/bin/activate`
2. Check Python: `which python` (should show `venv/bin/python`)
3. Reinstall: `pip install -r requirements.txt`

### Issue: "spaCy model not found"
**Fix:**
```bash
source venv/bin/activate
python -m spacy download en_core_web_sm
```

### Issue: "Port already in use"
**Fix:** Use a different port:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Issue: Installation takes too long
**Normal:** First installation takes 5-10 minutes due to:
- PyTorch (~2GB)
- Transformers library
- Sentence transformers
- All dependencies

---

## Quick Test

After setup, test the service:

```bash
# In one terminal
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# In another terminal
curl http://localhost:8000/
# Should return: {"status":"ok"}

curl http://localhost:8000/docs
# Should open FastAPI docs in browser
```

---

## Expected Output When Starting

```
INFO:     Will watch for changes in these directories: ['/path/to/ai-service']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## Once Working Locally

If it works locally but not on Railway:
1. Check Railway environment variables
2. Check Railway start command
3. Compare local vs Railway Python versions
4. Check Railway logs for specific errors

---

**Last Updated:** 2024

