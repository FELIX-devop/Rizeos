# Fixing AI Service Crash/Rebuild Loop

## Problem
Service builds successfully but crashes immediately after starting, causing Railway to automatically rebuild in a loop.

---

## Common Causes

### 1. Start Command Issues
- Virtual environment not activated
- Wrong port configuration
- Missing environment variables

### 2. Application Errors
- Import errors
- Missing dependencies
- Configuration issues

### 3. Port Configuration
- Not using `$PORT` variable
- Port conflict

---

## Step-by-Step Fix

### Step 1: Check Deploy Logs (Not Build Logs)

1. Go to **Railway** → **AI Service** → **Deploy Logs** tab
2. Look for error messages after "Application startup"
3. Common errors:
   - `ModuleNotFoundError`
   - `ImportError`
   - `Port already in use`
   - `Application startup failed`

### Step 2: Verify Start Command

Go to **AI Service** → **Settings** → Check **Start Command**

**Correct Start Command:**
```bash
. /opt/venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Or (if venv is in PATH):**
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Common Mistakes:**
- ❌ `uvicorn app.main:app --port 8000` (hardcoded port)
- ❌ `python app/main.py` (wrong entry point)
- ❌ Missing `--host 0.0.0.0` (won't accept external connections)

### Step 3: Check Environment Variables

Go to **AI Service** → **Variables** tab

**Required Variables:**
```
PORT=8000
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
```

**Note:** Railway auto-sets `PORT`, but include it for clarity.

### Step 4: Verify Application Code

Check if `app/main.py` has the correct FastAPI setup:

```python
import os
from fastapi import FastAPI

PORT = int(os.getenv("PORT", "8000"))

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok"}

# ... rest of your code
```

### Step 5: Check for Import Errors

Look in **Deploy Logs** for:
- `ModuleNotFoundError: No module named 'X'`
- `ImportError: cannot import name 'X'`

If you see these, check `requirements.txt` includes all dependencies.

### Step 6: Verify File Structure

Ensure your `ai-service/` folder has:
```
ai-service/
├── app/
│   └── main.py          ← Must exist
├── requirements.txt     ← Must exist
├── nixpacks.toml        ← Optional but recommended
└── railway.json         ← Optional but recommended
```

---

## Quick Fixes

### Fix 1: Update Start Command

1. **Railway** → **AI Service** → **Settings**
2. Find **Start Command**
3. Set to:
   ```bash
   . /opt/venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Save and redeploy

### Fix 2: Check nixpacks.toml

Ensure `nixpacks.toml` has correct start command:

```toml
[start]
cmd = ". /opt/venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

### Fix 3: Check railway.json

Ensure `railway.json` has correct start command:

```json
{
  "deploy": {
    "startCommand": ". /opt/venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

### Fix 4: Add Health Check Endpoint

Ensure your `app/main.py` has a root endpoint:

```python
@app.get("/")
def root():
    return {"status": "ok"}
```

---

## Debugging Steps

### 1. Check Deploy Logs for Errors

Look for lines like:
```
ERROR:    Application startup failed
Traceback (most recent call last):
  ...
```

### 2. Test Locally First

Run locally to catch errors:
```bash
cd ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Check Model Loading

If using ML models, they might be too large or taking too long to load. Check logs for:
- Model download errors
- Memory issues
- Timeout errors

---

## Expected Deploy Logs (When Working)

```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## Common Error Messages and Fixes

### Error: "Port already in use"
**Fix:** Ensure using `$PORT` not hardcoded port

### Error: "ModuleNotFoundError: No module named 'app'"
**Fix:** Check root directory is set to `ai-service`, not root

### Error: "Application startup failed"
**Fix:** Check Deploy Logs for specific Python error

### Error: "Connection refused"
**Fix:** Ensure `--host 0.0.0.0` is in start command

---

## After Fixing

1. ✅ Service stays "Online" (green dot)
2. ✅ No automatic rebuilds
3. ✅ Health endpoint responds: `{"status":"ok"}`
4. ✅ API docs accessible at `/docs`

---

**Last Updated:** 2024

