# Troubleshooting: No Deploy Logs

## Problem
Service builds successfully but shows no deploy logs, or logs appear empty.

---

## Why No Logs Appear

### 1. Service Crashes Immediately
- Crashes before any output is generated
- Start command fails silently
- Application fails to import

### 2. Logs Not Being Captured
- Railway logging issue
- Output not being flushed
- Wrong log tab selected

### 3. Service Not Starting
- Start command incorrect
- Port conflict
- Missing dependencies

---

## Step-by-Step Debugging

### Step 1: Check All Log Tabs

In Railway, check **ALL** log types:

1. **Build Logs** - Shows build process ✅ (you see this)
2. **Deploy Logs** - Shows application startup ❌ (empty)
3. **HTTP Logs** - Shows HTTP requests (if service is running)

**Action:** Click on **Deploy Logs** tab and wait a few seconds for logs to appear.

### Step 2: Check Service Status

Look at the service card:
- **Green dot + "Online"** = Service is running (check HTTP Logs)
- **Red dot + "Offline"** = Service crashed (check Deploy Logs)
- **Yellow dot + "Building"** = Still deploying
- **Spinning + "Building"** = In rebuild loop

### Step 3: Add Debugging to Start Command

I've created a `start.sh` script with debugging output. This will:
- Show environment variables
- Show Python version
- Show each step of startup
- Help identify where it fails

### Step 4: Check Railway Settings

1. Go to **AI Service** → **Settings**
2. Verify **Start Command** is set correctly
3. Check **Root Directory** is `ai-service`
4. Verify **Environment Variables** are set

### Step 5: Try Manual Start Command

In Railway Settings, try this start command:
```bash
. /opt/venv/bin/activate && python -c "print('Starting...'); import app.main; print('Import successful')" && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This will show if imports are working.

---

## Quick Fixes

### Fix 1: Use Start Script (Already Added)

I've created `ai-service/start.sh` with debugging. Railway will use this automatically.

### Fix 2: Check if Service is Actually Running

Even with no deploy logs, the service might be running:

```bash
curl https://rizeos-production-7106.up.railway.app/
```

If you get a response (even an error), the service IS running.

### Fix 3: Check HTTP Logs Instead

1. Go to **AI Service** → **HTTP Logs** tab
2. Make a request: `curl https://rizeos-production-7106.up.railway.app/`
3. Check if logs appear here

### Fix 4: Force Log Output

The start script now includes `echo` statements that will appear in logs.

---

## What to Check in Railway

### 1. Service Status Indicator
- What color is the dot?
- What does the status say?

### 2. Latest Deployment
- Go to **Deployments** tab
- Click latest deployment
- Check status: "Active", "Failed", "Building"?

### 3. Environment Variables
- Go to **Variables** tab
- Ensure `PORT`, `MODEL_NAME`, `SPACY_MODEL` are set

### 4. Settings
- **Root Directory**: `ai-service`
- **Start Command**: Should use the start script now

---

## Expected Behavior After Fix

With the new `start.sh` script, you should see in Deploy Logs:

```
=== AI Service Startup Script ===
PORT: 8000
MODEL_NAME: sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL: en_core_web_sm
Python version:
Python 3.11.x
Activating virtual environment...
Virtual environment activated
Python path:
/opt/venv/bin/python
Starting uvicorn...
INFO:     Started server process
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## If Still No Logs

### Option 1: Check Service Health
```bash
curl -v https://rizeos-production-7106.up.railway.app/
```

### Option 2: Check Railway Status Page
- Check if Railway is having issues
- Check service status in dashboard

### Option 3: Restart Service
1. Railway → AI Service → Settings
2. Click **"Restart"** or **"Redeploy"**
3. Watch for logs during restart

---

## Next Steps

1. ✅ I've added `start.sh` with debugging
2. ✅ Updated `nixpacks.toml` and `railway.json` to use it
3. ⏳ Wait for Railway to redeploy
4. ⏳ Check **Deploy Logs** tab after redeploy
5. ⏳ You should now see startup messages

---

**The start script will help identify exactly where the service is failing!**

