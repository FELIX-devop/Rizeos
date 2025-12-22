# How to Find Your Railway Service URLs

## Finding AI Service URL

### Step 1: Open Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app)
2. Log in to your account

### Step 2: Navigate to AI Service
1. Find your **AI Service** project/service in the dashboard
2. Click on the **AI Service** service (the one with Python/FastAPI)

### Step 3: Get the URL
You have **two options** to find the URL:

#### Option A: From Service Settings
1. Click on the **AI Service** card
2. Click on **Settings** tab (gear icon)
3. Scroll down to **Networking** section
4. Look for **Public Domain** or **Custom Domain**
5. Copy the URL (e.g., `https://ai-service-production.up.railway.app`)

#### Option B: From Deployments Tab
1. Click on the **AI Service** card
2. Click on **Deployments** tab
3. Click on the latest deployment
4. Look for the **Public URL** or **Domain** in the deployment details
5. Copy the URL

#### Option C: From Service Overview
1. Click on the **AI Service** card
2. In the main service view, look for a **"Generate Domain"** button or existing domain
3. If no domain exists, click **"Generate Domain"** to create one
4. Copy the generated URL

---

## Example URLs

Railway URLs typically look like:
```
https://ai-service-production.up.railway.app
https://ai-service-production-xxxx.up.railway.app
https://your-ai-service-name.up.railway.app
```

---

## Verify AI Service is Running

After getting the URL, verify it's working:

### 1. Health Check
```bash
curl https://your-ai-service-url.up.railway.app/
```
Should return:
```json
{"status":"ok"}
```

### 2. API Documentation
Open in browser:
```
https://your-ai-service-url.up.railway.app/docs
```
You should see FastAPI Swagger documentation.

### 3. Alternative Health Check
```bash
curl https://your-ai-service-url.up.railway.app/health
```

---

## Finding Backend Service URL

Same process for Backend service:

1. Go to Railway Dashboard
2. Click on **Backend** service (Go + Gin)
3. Go to **Settings** → **Networking**
4. Copy the **Public Domain** URL
5. Use this for `CORS_ALLOWED_ORIGINS` after frontend deployment

---

## Setting Up Custom Domains (Optional)

If you want a custom domain:

1. Go to **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `ai.yourapp.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

---

## Quick Checklist

- [ ] AI Service deployed successfully
- [ ] Found AI Service URL in Railway
- [ ] Verified AI Service is accessible (health check works)
- [ ] Copied AI Service URL
- [ ] Updated `AI_SERVICE_URL` in Backend service variables
- [ ] Backend service redeployed with new `AI_SERVICE_URL`

---

## Common Issues

### ❌ "No domain found"
- **Solution**: Click **"Generate Domain"** in Settings → Networking

### ❌ "Service not accessible"
- **Check**: Service is deployed and running (check Deployments tab)
- **Check**: Service logs for errors
- **Check**: Environment variables are set correctly

### ❌ "404 Not Found"
- **Check**: Service is using correct start command
- **Check**: Service is listening on correct port (`$PORT`)

---

## After Finding AI Service URL

1. **Copy the URL** (e.g., `https://ai-service-production.up.railway.app`)

2. **Update Backend Environment Variable:**
   - Go to **Backend** service → **Variables** tab
   - Find `AI_SERVICE_URL`
   - Update value to: `https://your-actual-ai-service-url.up.railway.app`
   - Save (Railway will auto-redeploy)

3. **Verify Connection:**
   - Check Backend logs for successful connection to AI service
   - Test an AI endpoint from Backend

---

**Last Updated:** 2024

