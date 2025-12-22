# Railway AI Service - Quick Setup Guide

## ✅ Your Local Setup (Working)
```bash
cd ai-service
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🚀 Railway Configuration (Matches Local)

### Step 1: Create New Service
1. Railway Dashboard → **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Click **"Deploy Now"**

### Step 2: Configure Settings

**Root Directory:**
```
ai-service
```

**Start Command:**
```
bash start.sh
```

*(This is equivalent to your local `uvicorn app.main:app --host 0.0.0.0 --port 8000`)*

### Step 3: Environment Variables

Add these in **Variables** tab:

```
PORT=8000
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
```

---

## 📋 Configuration Summary

| Setting | Value |
|---------|-------|
| **Root Directory** | `ai-service` |
| **Start Command** | `bash start.sh` |
| **PORT** | `8000` |
| **MODEL_NAME** | `sentence-transformers/all-MiniLM-L6-v2` |
| **SPACY_MODEL** | `en_core_web_sm` |

---

## 🔍 What `start.sh` Does (Matches Your Local Command)

The `start.sh` script we created does:
1. Activates virtual environment (`source /opt/venv/bin/activate`)
2. Verifies app imports work
3. Runs: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

This is exactly what your local command does!

---

## ✅ Verification Steps

After deployment:

1. **Check Status:** Service should show "Online" (green dot)

2. **Test Health:**
   ```bash
   curl https://your-service-url.up.railway.app/
   ```
   Should return: `{"status":"ok"}`

3. **Check API Docs:**
   ```
   https://your-service-url.up.railway.app/docs
   ```

4. **Check Deploy Logs:**
   Should see:
   ```
   ✅ App import successful!
   INFO:     Started server process
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

---

## 🎯 Key Points

- ✅ Your local setup works perfectly
- ✅ Railway config matches your local setup
- ✅ `start.sh` script handles the startup (like your local commands)
- ✅ Same uvicorn command, just automated

---

**Your service should work on Railway exactly like it works locally!** 🚀

