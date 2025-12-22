# Create New AI Service in Railway - Step by Step

## Prerequisites
✅ Your local AI service is working  
✅ Code is pushed to GitHub  
✅ You have a Railway account

---

## Step 1: Open Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Log in to your account
3. Select your project (or create a new one)

---

## Step 2: Create New Service

1. In your Railway project, click **"+ New"** button (top right)
2. Select **"GitHub Repo"**
3. Choose your repository (the one with `ai-service` folder)
4. Click **"Deploy Now"**

---

## Step 3: Configure Root Directory

**CRITICAL:** This is the most important step!

1. After Railway detects your repo, click on the new service
2. Go to **Settings** tab
3. Scroll to **"Root Directory"**
4. Set it to: **`ai-service`**
5. Click **"Save"**

⚠️ **Important:** If you don't set this, Railway will look for files in the root directory and fail!

---

## Step 4: Verify Build Configuration

Railway should auto-detect Python, but verify:

1. Go to **Settings** tab
2. Check **"Build Command"** - should be auto-detected or from `nixpacks.toml`
3. Check **"Start Command"** - should be: `bash start.sh`

If not set correctly:
- **Build Command:** (leave empty or use from `nixpacks.toml`)
- **Start Command:** `bash start.sh`

---

## Step 5: Add Environment Variables

1. Go to **Variables** tab
2. Click **"+ New Variable"** for each:

**Variable 1:**
```
Key: PORT
Value: 8000
```

**Variable 2:**
```
Key: MODEL_NAME
Value: sentence-transformers/all-MiniLM-L6-v2
```

**Variable 3:**
```
Key: SPACY_MODEL
Value: en_core_web_sm
```

---

## Step 6: Wait for Deployment

1. Railway will automatically start building
2. Go to **Deployments** tab to watch progress
3. First deployment takes **5-10 minutes** (downloads ML models)
4. Watch **Build Logs** for progress

---

## Step 7: Get Service URL

After deployment completes:

1. Go to **Settings** → **Networking** tab
2. Look for **"Public Domain"**
3. Copy the URL (e.g., `https://your-service-name.up.railway.app`)
4. **Save this URL** - you'll need it for backend configuration

---

## Step 8: Verify Service is Running

### Test Health Endpoint
```bash
curl https://your-service-url.up.railway.app/
```

Should return: `{"status":"ok"}`

### Test API Docs
Open in browser:
```
https://your-service-url.up.railway.app/docs
```

Should show FastAPI Swagger UI.

---

## Step 9: Update Backend Configuration

1. Go to **Backend Service** → **Variables** tab
2. Find `AI_SERVICE_URL`
3. Update with your new AI service URL:
   ```
   AI_SERVICE_URL=https://your-new-ai-service-url.up.railway.app
   ```
4. Save (Railway will auto-redeploy backend)

---

## Expected Build Logs

You should see:
```
✓ stage-0 RUN python -m venv --copies /opt/venv
✓ stage-0 RUN pip install --upgrade pip
✓ stage-0 RUN pip install -r requirements.txt
  Successfully installed [all packages]
✓ stage-0 RUN pip install en_core_web_sm-3.7.1
  Successfully installed en-core-web-sm-3.7.1
✓ Build completed successfully
```

---

## Expected Deploy Logs

You should see:
```
=== AI Service Startup Script ===
PORT: 8000
MODEL_NAME: sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL: en_core_web_sm
Python version:
Python 3.11.x
Activating virtual environment...
Virtual environment activated
Python path: /opt/venv/bin/python
Checking app import...
✅ App import successful!
Starting uvicorn...
INFO:     Started server process
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Troubleshooting

### ❌ Build Fails
- **Check:** Root Directory is set to `ai-service`
- **Check:** `requirements.txt` exists in `ai-service/` folder
- **Check:** Build logs for specific errors

### ❌ Service Crashes
- **Check:** Deploy Logs for error messages
- **Check:** Environment variables are set
- **Check:** Start command is `bash start.sh`

### ❌ 404 Error
- **Check:** Service is "Online" (green dot)
- **Check:** URL is correct
- **Check:** Wait a few minutes after deployment

### ❌ No Deploy Logs
- **Check:** Service status (might be building)
- **Check:** Wait for build to complete first
- **Check:** Click on latest deployment

---

## Quick Checklist

- [ ] Created new service from GitHub repo
- [ ] Set Root Directory to `ai-service`
- [ ] Verified Start Command is `bash start.sh`
- [ ] Added environment variables (PORT, MODEL_NAME, SPACY_MODEL)
- [ ] Build completed successfully
- [ ] Service shows "Online" status
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] API docs accessible at `/docs`
- [ ] Updated backend `AI_SERVICE_URL`

---

## Configuration Summary

**Root Directory:** `ai-service`  
**Start Command:** `bash start.sh`  
**Environment Variables:**
- `PORT=8000`
- `MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2`
- `SPACY_MODEL=en_core_web_sm`

---

**Follow these steps and your AI service will be deployed successfully!** 🚀

