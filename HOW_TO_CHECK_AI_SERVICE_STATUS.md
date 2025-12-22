# How to Check if AI Service is Running

## Quick Methods to Verify AI Service Status

---

## Method 1: Railway Dashboard (Easiest)

### Step 1: Open Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Log in to your account

### Step 2: Check Service Status
1. Find your **AI Service** (the one with URL `rizeos-production-7106.up.railway.app`)
2. Look at the service card:
   - ✅ **Green indicator** = Service is running
   - ❌ **Red indicator** = Service is stopped/error
   - 🟡 **Yellow indicator** = Service is deploying/restarting

### Step 3: Check Deployment Status
1. Click on **AI Service**
2. Go to **Deployments** tab
3. Check the latest deployment:
   - ✅ **"Active"** = Service is running
   - ❌ **"Failed"** = Service has errors
   - 🟡 **"Building"** = Still deploying

---

## Method 2: Health Check Endpoint (Recommended)

### Test the Root Endpoint
```bash
curl https://rizeos-production-7106.up.railway.app/
```

**Expected Response:**
```json
{"status":"ok"}
```

**If it works:** ✅ Service is running  
**If it fails:** ❌ Service is not accessible

### Test with Browser
Open in your browser:
```
https://rizeos-production-7106.up.railway.app/
```

Should show: `{"status":"ok"}`

---

## Method 3: API Documentation Endpoint

### Check FastAPI Docs
Open in browser:
```
https://rizeos-production-7106.up.railway.app/docs
```

**Expected:** You should see FastAPI Swagger UI with all endpoints

**If you see the docs:** ✅ Service is running correctly  
**If 404 or error:** ❌ Service may not be running or misconfigured

### Alternative Docs URL
```
https://rizeos-production-7106.up.railway.app/redoc
```

---

## Method 4: Check Service Logs

### In Railway Dashboard
1. Go to **AI Service** → **Deployments** tab
2. Click on the latest deployment
3. Click **"View Logs"** or **"Logs"** tab
4. Look for:
   - ✅ `Application startup complete`
   - ✅ `Uvicorn running on`
   - ✅ `Listening on port`
   - ❌ Error messages (Python errors, import errors, etc.)

### What to Look For in Logs

**Good Signs:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Bad Signs:**
```
ERROR:    Application startup failed
ModuleNotFoundError
ImportError
Connection refused
Port already in use
```

---

## Method 5: Test Specific Endpoints

### Test Skills Extraction Endpoint
```bash
curl -X POST https://rizeos-production-7106.up.railway.app/skills/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "I am a software engineer with Python and JavaScript skills"}'
```

**Expected:** JSON response with extracted skills

### Test Recommendations Endpoint
```bash
curl https://rizeos-production-7106.up.railway.app/recommendations/recruiter
```

**Expected:** JSON response with recommendations

---

## Method 6: Check from Backend Service

If your backend is deployed, test the connection:

```bash
# From your backend service
curl https://your-backend.railway.app/api/ai/match-score
```

If backend can reach AI service: ✅ AI service is running  
If backend gets connection errors: ❌ AI service may be down

---

## Quick Status Check Script

Create a file `check_ai_service.sh`:

```bash
#!/bin/bash

AI_SERVICE_URL="https://rizeos-production-7106.up.railway.app"

echo "Checking AI Service Status..."
echo "URL: $AI_SERVICE_URL"
echo ""

# Test root endpoint
echo "1. Testing root endpoint (/):"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$AI_SERVICE_URL/")
if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Service is responding (HTTP $RESPONSE)"
    curl -s "$AI_SERVICE_URL/" | head -1
else
    echo "   ❌ Service not responding (HTTP $RESPONSE)"
fi

echo ""

# Test docs endpoint
echo "2. Testing docs endpoint (/docs):"
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$AI_SERVICE_URL/docs")
if [ "$DOCS_RESPONSE" = "200" ]; then
    echo "   ✅ API docs accessible (HTTP $DOCS_RESPONSE)"
else
    echo "   ❌ API docs not accessible (HTTP $DOCS_RESPONSE)"
fi

echo ""
echo "Status check complete!"
```

Run it:
```bash
chmod +x check_ai_service.sh
./check_ai_service.sh
```

---

## Common Issues and Solutions

### ❌ "Application not found" (404)
**Cause:** Service not deployed or URL incorrect  
**Solution:** 
- Check Railway dashboard for service status
- Verify the URL is correct
- Check if service is deployed

### ❌ "Connection refused" or "Timeout"
**Cause:** Service is stopped or not running  
**Solution:**
- Check Railway dashboard
- Restart the service
- Check deployment logs for errors

### ❌ "502 Bad Gateway"
**Cause:** Service crashed or not responding  
**Solution:**
- Check Railway logs for errors
- Restart the service
- Check environment variables

### ❌ "503 Service Unavailable"
**Cause:** Service is deploying or restarting  
**Solution:**
- Wait a few minutes
- Check deployment status in Railway

---

## Quick Checklist

- [ ] Service shows green status in Railway dashboard
- [ ] Latest deployment is "Active"
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] API docs accessible at `/docs`
- [ ] No errors in Railway logs
- [ ] Backend can connect to AI service

---

## Expected Response Times

- **Health check:** < 1 second
- **API docs:** < 2 seconds
- **Skills extraction:** 2-5 seconds (first request may be slower due to model loading)

---

**Last Updated:** 2024

