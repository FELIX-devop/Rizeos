# Fixing AI Service 404 Error

## Current Error
```
{"status":"error","code":404,"message":"Application not found"}
```

This means Railway cannot find or route to your application.

---

## Possible Causes

### 1. Service Not Deployed
- Service was never deployed
- Deployment failed
- Service was deleted

### 2. Service Stopped
- Service is paused/stopped
- Service crashed and didn't restart

### 3. Wrong URL
- URL is incorrect
- Service has a different domain

### 4. Build/Start Command Issues
- Build failed
- Start command incorrect
- Application not listening on correct port

---

## Step-by-Step Fix

### Step 1: Check Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Find your **AI Service** project
3. Check service status:
   - **Green dot** = Running (but may have routing issues)
   - **Red dot** = Stopped/Failed
   - **Yellow dot** = Deploying

### Step 2: Verify Service Exists

1. In Railway dashboard, check if you have an AI Service
2. If missing, create it:
   - Click **"+ New"** → **"GitHub Repo"**
   - Select your repository
   - Set **Root Directory**: `ai-service`
   - Configure build/start commands

### Step 3: Check Deployment Status

1. Click on **AI Service**
2. Go to **Deployments** tab
3. Check latest deployment:
   - ✅ **"Active"** = Should be working
   - ❌ **"Failed"** = Check logs for errors
   - 🟡 **"Building"** = Wait for completion

### Step 4: Check Service Logs

1. Go to **AI Service** → **Deployments**
2. Click latest deployment → **"View Logs"**
3. Look for errors:
   - `ModuleNotFoundError`
   - `ImportError`
   - `Port already in use`
   - `Application startup failed`

### Step 5: Verify Environment Variables

1. Go to **AI Service** → **Variables** tab
2. Ensure these are set:
   ```
   PORT=8000
   MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
   SPACY_MODEL=en_core_web_sm
   ```

### Step 6: Check Start Command

1. Go to **AI Service** → **Settings**
2. Verify **Start Command**:
   ```
   . /opt/venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   Or:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Step 7: Verify Root Directory

1. Go to **AI Service** → **Settings**
2. Check **Root Directory** is set to: `ai-service`
3. Not: `backend`, `frontend`, or empty

### Step 8: Check Domain/URL

1. Go to **AI Service** → **Settings** → **Networking**
2. Verify **Public Domain** matches:
   - `rizeos-production-7106.up.railway.app`
3. If different, update `AI_SERVICE_URL` in backend

---

## Common Fixes

### Fix 1: Restart Service
1. Railway → AI Service → **Settings**
2. Click **"Restart"** or **"Redeploy"**

### Fix 2: Check Build Logs
1. Railway → AI Service → **Deployments**
2. Open latest deployment
3. Check for build errors
4. Common issues:
   - Missing `requirements.txt`
   - Python version mismatch
   - spaCy model download failed

### Fix 3: Verify File Structure
Ensure `ai-service/` folder contains:
```
ai-service/
├── app/
│   └── main.py
├── requirements.txt
├── nixpacks.toml
└── railway.json
```

### Fix 4: Check Port Configuration
- Service must listen on `$PORT` (Railway sets this)
- Start command must use `--port $PORT`
- Not hardcoded like `--port 8000`

---

## Quick Diagnostic Commands

### Check if service responds
```bash
curl -v https://rizeos-production-7106.up.railway.app/
```

### Check API docs
```bash
curl https://rizeos-production-7106.up.railway.app/docs
```

### Check health endpoint
```bash
curl https://rizeos-production-7106.up.railway.app/health
```

---

## If Service Doesn't Exist

### Create New AI Service

1. **Railway Dashboard** → Your Project
2. Click **"+ New"** → **"GitHub Repo"**
3. Select your repository
4. **Configure:**
   - **Root Directory**: `ai-service`
   - **Build Command**: (auto-detected or from `nixpacks.toml`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Variables:**
   - `PORT=8000`
   - `MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2`
   - `SPACY_MODEL=en_core_web_sm`
6. **Wait for deployment** (5-10 minutes first time)
7. **Get new URL** from Settings → Networking

---

## Expected Logs (When Working)

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## Next Steps After Fix

1. ✅ Service responds with `{"status":"ok"}`
2. ✅ API docs accessible at `/docs`
3. ✅ Update backend `AI_SERVICE_URL` if URL changed
4. ✅ Test backend → AI service connection

---

**Last Updated:** 2024

