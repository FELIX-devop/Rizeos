# Debug AI Service - Resume Parsing Not Working

## Current Issue
- Service shows "Online" in Railway
- But URL `https://rizeos-production-7106.up.railway.app` returns "Application not found"
- Resume parsing fails with 404 on OPTIONS request

## Steps to Fix

### 1. Verify Actual Service URL
```bash
# In Railway Dashboard:
# AI Service → Settings → Networking → Public Domain
# Copy the EXACT URL shown
```

### 2. Test the Service
```bash
# Replace with your actual URL
curl https://YOUR_ACTUAL_URL.up.railway.app/

# Expected: {"status":"ok"}
# If "Application not found" → URL is wrong or service not deployed
```

### 3. Test OPTIONS (CORS Preflight)
```bash
curl -X OPTIONS https://YOUR_ACTUAL_URL.up.railway.app/skills/extract \
  -H "Origin: https://rizeos.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should return 200 OK with CORS headers
# If 404 → Service not running or URL wrong
```

### 4. Test POST Request
```bash
curl -X POST https://YOUR_ACTUAL_URL.up.railway.app/skills/extract \
  -H "Content-Type: application/json" \
  -H "Origin: https://rizeos.vercel.app" \
  -d '{"text": "Python, React, Node.js"}'

# Should return: {"skills": [...], "extractedSkills": [...]}
```

### 5. Update Environment Variables

**If URL is different, update:**

1. **Vercel:**
   - Settings → Environment Variables
   - Update `VITE_AI_URL` with correct URL
   - Redeploy

2. **Railway Backend:**
   - Variables tab
   - Update `AI_SERVICE_URL` with correct URL
   - Service will auto-redeploy

### 6. Check Railway Service Status

In Railway Dashboard:
- [ ] Service shows "Online" (green dot)
- [ ] Deploy Logs show "Deployed successfully"
- [ ] No errors in Deploy Logs
- [ ] Public Domain URL matches what you're using

### 7. Common Issues

**Issue: "Application not found"**
- Service URL is wrong
- Service is not actually deployed
- Railway service was deleted/recreated

**Issue: OPTIONS returns 404**
- Service not running
- URL incorrect
- CORS middleware not working (should be fixed in code)

**Issue: CORS error in browser**
- OPTIONS preflight failing
- Origin not allowed
- Service URL mismatch

## Quick Test Script

```bash
#!/bin/bash
AI_URL="https://YOUR_ACTUAL_URL.up.railway.app"

echo "Testing root endpoint..."
curl -s "$AI_URL/" && echo ""

echo "Testing OPTIONS..."
curl -X OPTIONS "$AI_URL/skills/extract" \
  -H "Origin: https://rizeos.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -E "(HTTP|access-control)"

echo "Testing POST..."
curl -X POST "$AI_URL/skills/extract" \
  -H "Content-Type: application/json" \
  -d '{"text": "Python, React"}' && echo ""
```

