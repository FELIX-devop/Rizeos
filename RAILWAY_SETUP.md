# Railway Setup Instructions

## ⚠️ Important: Root Directory Configuration

Railway needs to know which service to build. Since your repository contains multiple services (backend, ai-service, frontend), you must configure the **Root Directory** for each service.

---

## Step-by-Step Setup

### For Backend Service

1. **Create New Service in Railway:**
   - Go to your Railway project
   - Click **"New Service"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

2. **Configure Root Directory:**
   - Click on the service
   - Go to **Settings** tab
   - Scroll to **"Root Directory"**
   - Set to: `backend`
   - Click **Save**

3. **Configure Build Settings:**
   - Go to **Settings** → **Build Command**
   - Set to: `cd backend && go build -o server ./cmd/server`
   - Or leave empty (Railway will auto-detect Go)

4. **Configure Start Command:**
   - Go to **Settings** → **Start Command**
   - Set to: `./server`

5. **Add Environment Variables:**
   - Go to **Variables** tab
   - Add all variables from `RAILWAY_ENV_VARS.txt`
   - **Important:** Set `MONGO_URI` with your MongoDB connection string

6. **Deploy:**
   - Railway will automatically detect Go and build
   - Wait for deployment to complete

---

### For AI Service

1. **Create New Service:**
   - In the same Railway project
   - Click **"New Service"**
   - Select **"Deploy from GitHub repo"**
   - Choose the same repository

2. **Configure Root Directory:**
   - Click on the service
   - Go to **Settings** tab
   - Scroll to **"Root Directory"**
   - Set to: `ai-service`
   - Click **Save**

3. **Configure Build Settings:**
   - Go to **Settings** → **Build Command**
   - Set to: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`

4. **Configure Start Command:**
   - Go to **Settings** → **Start Command**
   - Set to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables:**
   - Go to **Variables** tab
   - Add:
     ```
     PORT=8000
     MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
     SPACY_MODEL=en_core_web_sm
     ```

6. **Deploy:**
   - Railway will automatically detect Python
   - **First deployment takes longer** (downloads ML models ~500MB)
   - Wait for deployment to complete

---

## Alternative: Using Railway CLI

If you prefer using Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Set root directory for backend
railway service create backend
cd backend
railway up

# Set root directory for AI service
railway service create ai-service
cd ai-service
railway up
```

---

## Troubleshooting

### Error: "Railpack could not determine how to build the app"

**Solution:** Set the **Root Directory** in Railway settings:
- Go to Service → Settings → Root Directory
- Set to `backend` for backend service
- Set to `ai-service` for AI service

### Error: "Script start.sh not found"

**Solution:** Set the **Start Command** in Railway settings:
- Backend: `./server`
- AI Service: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Error: "Build failed"

**Check:**
- Root directory is set correctly
- Build command is correct
- Environment variables are set
- Check Railway logs for specific errors

---

## Quick Reference

### Backend Service Settings

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `cd backend && go build -o server ./cmd/server` |
| Start Command | `./server` |
| Port | `8080` (auto-set by Railway) |

### AI Service Settings

| Setting | Value |
|---------|-------|
| Root Directory | `ai-service` |
| Build Command | `pip install -r requirements.txt && python -m spacy download en_core_web_sm` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Port | `8000` (auto-set by Railway) |

---

## Visual Guide

### Railway Service Settings Location

```
Railway Project
├── Service: backend
│   └── Settings
│       ├── Root Directory: backend  ← SET THIS!
│       ├── Build Command: cd backend && go build -o server ./cmd/server
│       └── Start Command: ./server
│
└── Service: ai-service
    └── Settings
        ├── Root Directory: ai-service  ← SET THIS!
        ├── Build Command: pip install -r requirements.txt && python -m spacy download en_core_web_sm
        └── Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

**Last Updated:** 2024

