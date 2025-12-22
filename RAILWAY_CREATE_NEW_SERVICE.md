# How to Create a New Service in Railway

## 🎯 Goal

Create a new service for your **AI Service** in the same Railway project.

---

## Step-by-Step Instructions

### Step 1: Open Your Railway Project

1. Go to [railway.app](https://railway.app)
2. Log in to your account
3. You'll see your **Projects** dashboard
4. Click on your **RizeOS** project (or the project name you created)

---

### Step 2: Create New Service

**Option A: Using the "+ New" Button**

1. In your project dashboard, look for:
   - A **"+ New"** button (usually top right or center)
   - Or **"+ Add Service"** button
   - Or **"New Service"** link

2. Click the button/link

3. A menu or modal will appear with options:
   - **"GitHub Repo"** ← Click this
   - "Empty Service"
   - "Database"
   - etc.

**Option B: Using the Sidebar**

1. Look at the left sidebar in your project
2. You might see a **"Services"** section
3. Click **"+ Add Service"** or **"New Service"**

---

### Step 3: Connect GitHub Repository

1. After clicking **"GitHub Repo"**, you'll see:
   - A list of your GitHub repositories
   - Or a search box to find your repo

2. **Select your repository:**
   - Find **"RizeOS"** or your repository name
   - Click on it

3. Railway will start detecting the project

---

### Step 4: Configure the Service

After selecting the repository, Railway will show service configuration:

1. **Service Name:**
   - Railway might auto-name it
   - You can rename it to: **"AI Service"** or **"ai-service"**

2. **Root Directory:**
   - This is **CRITICAL**!
   - Click on **"Root Directory"** or **"Settings"**
   - Set to: `ai-service`
   - Click **Save**

3. **Build Settings:**
   - Go to **Settings** tab
   - Find **"Build Command"**
   - Set to:
     ```
     pip install -r requirements.txt && python -m spacy download en_core_web_sm
     ```

4. **Start Command:**
   - In the same Settings page
   - Find **"Start Command"**
   - Set to:
     ```
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

---

### Step 5: Add Environment Variables

1. Click on the **"Variables"** tab
2. Click **"+ New Variable"** or **"Add Variable"**
3. Add these variables one by one:

   **Variable 1:**
   - Key: `PORT`
   - Value: `8000`
   - Click **Add** or **Save**

   **Variable 2:**
   - Key: `MODEL_NAME`
   - Value: `sentence-transformers/all-MiniLM-L6-v2`
   - Click **Add** or **Save**

   **Variable 3:**
   - Key: `SPACY_MODEL`
   - Value: `en_core_web_sm`
   - Click **Add** or **Save**

---

### Step 6: Deploy

1. Railway will **automatically start deploying** after you configure it
2. You'll see build logs in the **"Deployments"** or **"Logs"** tab
3. **First deployment takes longer** (downloads ML models ~500MB)
4. Wait for deployment to complete

---

## 📸 Visual Guide

### Navigation Path:

```
Railway Dashboard
    ↓
Click "RizeOS" Project
    ↓
Click "+ New" or "+ Add Service"
    ↓
Select "GitHub Repo"
    ↓
Choose Your Repository
    ↓
Configure Service:
  - Root Directory: ai-service
  - Build Command: pip install -r requirements.txt && python -m spacy download en_core_web_sm
  - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    ↓
Add Environment Variables:
  - PORT=8000
  - MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
  - SPACY_MODEL=en_core_web_sm
    ↓
Deploy (automatic)
```

---

## 🎯 Quick Checklist

- [ ] Opened Railway project
- [ ] Clicked "+ New" or "+ Add Service"
- [ ] Selected "GitHub Repo"
- [ ] Chose your repository
- [ ] Set Root Directory to `ai-service`
- [ ] Set Build Command
- [ ] Set Start Command
- [ ] Added PORT variable
- [ ] Added MODEL_NAME variable
- [ ] Added SPACY_MODEL variable
- [ ] Deployment started
- [ ] Waiting for build to complete

---

## ⚠️ Important Notes

### Root Directory is Critical!

**MUST SET:** `ai-service`

If you don't set the root directory, Railway will try to build from the root of your repository and fail (just like the backend did initially).

### First Deployment Takes Longer

- Downloads Python dependencies
- Downloads ML models (~500MB)
- Downloads spaCy model
- Can take 5-10 minutes

**Be patient!** Check the logs to see progress.

---

## 🔍 Where to Find Things

### Service Settings:
- Click on your service name
- Click **"Settings"** tab (top menu)
- Scroll to find:
  - Root Directory
  - Build Command
  - Start Command

### Environment Variables:
- Click on your service name
- Click **"Variables"** tab (top menu)
- Click **"+ New Variable"** to add

### Deployment Logs:
- Click on your service name
- Click **"Deployments"** or **"Logs"** tab
- See build progress and errors

---

## 🆘 Troubleshooting

### Can't Find "+ New" Button?

1. **Make sure you're in a project** (not the dashboard)
2. **Look for:**
   - "+" icon in top right
   - "Add Service" in sidebar
   - "New" dropdown menu
3. **Try refreshing the page**

### Service Not Detecting Python?

1. **Check Root Directory:**
   - Must be set to `ai-service`
   - Not empty, not `backend`, not root

2. **Check Build Command:**
   - Must include `pip install -r requirements.txt`
   - Must include `python -m spacy download en_core_web_sm`

### Build Fails?

1. **Check Logs:**
   - Go to Deployments/Logs tab
   - Look for specific error messages

2. **Common Issues:**
   - Root Directory not set correctly
   - Build command incorrect
   - Requirements.txt not found (check root directory)

---

## ✅ After Deployment

Once deployed successfully:

1. **Get Service URL:**
   - Settings → Domains
   - Copy the URL: `https://your-ai-service.railway.app`

2. **Test Health Endpoint:**
   ```bash
   curl https://your-ai-service.railway.app/
   ```
   Should return: `{"status":"ok"}`

3. **Update Backend:**
   - Go to Backend Service → Variables
   - Update `AI_SERVICE_URL` with AI service URL

---

## 📝 Summary

1. **Railway Project** → Click **"+ New"**
2. **Select** → "GitHub Repo"
3. **Choose** → Your repository
4. **Configure** → Root Directory: `ai-service`
5. **Set** → Build Command and Start Command
6. **Add** → Environment Variables
7. **Wait** → For deployment (5-10 minutes first time)
8. **Get** → Service URL
9. **Update** → Backend `AI_SERVICE_URL`

---

**Follow these steps and your AI service will be deployed!** 🚀

