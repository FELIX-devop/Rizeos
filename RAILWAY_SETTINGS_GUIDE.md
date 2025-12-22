# How to Access Railway Settings - Step by Step

## 🎯 Quick Steps to Settings

### Step 1: Open Your Railway Project

1. Go to [railway.app](https://railway.app)
2. Log in to your account
3. You'll see your **Projects** dashboard
4. Click on your **RizeOS** project (or the project name you created)

---

### Step 2: Select Your Service

After clicking on your project, you'll see your services:

```
┌─────────────────────────────────────┐
│  RizeOS Project                     │
├─────────────────────────────────────┤
│  📦 Service 1 (Backend)             │  ← Click here
│  📦 Service 2 (AI Service)          │
│  📦 Service 3 (Frontend)            │
└─────────────────────────────────────┘
```

**Click on the service** you want to configure (Backend or AI Service)

---

### Step 3: Navigate to Settings

Once you click on a service, you'll see tabs at the top:

```
┌─────────────────────────────────────────────────────────┐
│  Service: Backend                                        │
├─────────────────────────────────────────────────────────┤
│  [Deployments] [Metrics] [Logs] [Settings] [Variables]  │
│                                    ↑                     │
│                              Click here!                 │
└─────────────────────────────────────────────────────────┘
```

**Click on the "Settings" tab**

---

### Step 4: Find Root Directory

In the Settings page, scroll down to find:

```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│  Service Name: Backend               │
│  ...                                 │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║  Root Directory               ║ │
│  ║  [backend                    ] ║ │ ← Enter here
│  ║                               ║ │
│  ║  The directory to build from  ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
│  Build Command                      │
│  Start Command                      │
│  ...                                 │
└─────────────────────────────────────┘
```

**Enter the root directory:**
- For Backend: `backend`
- For AI Service: `ai-service`

---

## 📸 Visual Guide

### Navigation Path:

```
Railway Dashboard
    ↓
Click Project (RizeOS)
    ↓
Click Service (Backend or AI Service)
    ↓
Click "Settings" Tab (at the top)
    ↓
Scroll to "Root Directory"
    ↓
Enter: `backend` or `ai-service`
    ↓
Click "Save" or "Update"
```

---

## 🔍 Alternative: Using the Sidebar

Some Railway interfaces show a sidebar:

```
┌──────────┬──────────────────────────┐
│          │  Service: Backend        │
│  📊      │                          │
│  Deploy  │  [Settings] ← Click     │
│  Metrics │                          │
│  Logs    │                          │
│  ⚙️      │                          │
│  Settings│                          │
│  Variables                          │
└──────────┴──────────────────────────┘
```

**Click "Settings" in the sidebar**

---

## 🎯 What to Configure

### For Backend Service:

1. **Root Directory:** `backend`
2. **Build Command:** `cd backend && go build -o server ./cmd/server`
3. **Start Command:** `./server`

### For AI Service:

1. **Root Directory:** `ai-service`
2. **Build Command:** `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
3. **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## ⚠️ If You Don't See Settings Tab

If you don't see a Settings tab:

1. **Make sure you clicked on a service** (not just the project)
2. **Check if you have permissions** (you need to be the project owner)
3. **Try refreshing the page**
4. **Look for a gear icon (⚙️)** - some interfaces use icons instead of text

---

## 🆘 Still Can't Find It?

### Option 1: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Set root directory via CLI
railway variables set RAILWAY_SERVICE_ROOT=backend
```

### Option 2: Check Railway Documentation

Visit: [Railway Docs - Settings](https://docs.railway.app/develop/configuration)

---

## ✅ After Setting Root Directory

1. **Save the settings**
2. Railway will automatically **redeploy** the service
3. Check the **Deployments** tab to see the build progress
4. Once deployed, check **Logs** to verify it's running

---

## 📝 Quick Checklist

- [ ] Logged into Railway
- [ ] Opened your project
- [ ] Clicked on the service (Backend or AI Service)
- [ ] Clicked "Settings" tab
- [ ] Found "Root Directory" field
- [ ] Entered `backend` or `ai-service`
- [ ] Set Build Command
- [ ] Set Start Command
- [ ] Clicked Save
- [ ] Service redeployed successfully

---

**Need Help?** Check the Railway logs in the "Logs" tab if deployment fails!

