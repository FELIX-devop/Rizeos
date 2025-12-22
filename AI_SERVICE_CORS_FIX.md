========================================
AI SERVICE CORS FIX - RESUME PARSING 404 ERROR
========================================

PROBLEM:
--------
Resume parsing fails with 404 on OPTIONS request:
- Request: OPTIONS https://rizeos-production-7106.up.railway.app/skills/extract
- Error: 404 Not Found
- Origin: https://rizeos.vercel.app

ROOT CAUSE:
-----------
1. FastAPI CORS middleware should handle OPTIONS automatically, but explicit handlers ensure compatibility
2. Service might not be running (check Railway dashboard)

FIXES APPLIED:
--------------
1. ✅ Added explicit OPTIONS handlers for /skills/extract and /match
2. ✅ Improved CORS middleware configuration
3. ✅ Explicitly included OPTIONS in allowed methods

NEXT STEPS:
-----------
1. **Check if AI Service is Running:**
   - Go to Railway Dashboard
   - Find your AI Service
   - Check if it shows "Online" status
   - Check Deploy Logs for errors

2. **Verify Service URL:**
   ```bash
   curl https://rizeos-production-7106.up.railway.app/
   ```
   Should return: `{"status":"ok"}`
   
   If you get: `{"status":"error","code":404,"message":"Application not found"}`
   → Service is not running or URL is wrong

3. **Get Correct Service URL:**
   - Railway Dashboard → AI Service → Settings → Networking
   - Copy the Public Domain URL
   - Update in Vercel: `VITE_AI_URL=https://your-actual-url.up.railway.app`
   - Update in Backend: `AI_SERVICE_URL=https://your-actual-url.up.railway.app`

4. **Redeploy AI Service:**
   - Railway will auto-deploy after git push
   - Or manually trigger redeploy in Railway dashboard
   - Wait for deployment to complete

5. **Test After Deployment:**
   ```bash
   # Test root endpoint
   curl https://your-ai-service-url.up.railway.app/
   
   # Test OPTIONS (CORS preflight)
   curl -X OPTIONS https://your-ai-service-url.up.railway.app/skills/extract \
     -H "Origin: https://rizeos.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -v
   
   # Test actual endpoint
   curl -X POST https://your-ai-service-url.up.railway.app/skills/extract \
     -H "Content-Type: application/json" \
     -d '{"text": "Python, React, Node.js"}'
   ```

6. **Update Environment Variables:**
   - Vercel: Settings → Environment Variables → `VITE_AI_URL`
   - Railway Backend: Variables → `AI_SERVICE_URL`
   - Redeploy both after updating

========================================
VERIFICATION CHECKLIST
========================================
[ ] AI Service shows "Online" in Railway
[ ] Root endpoint returns {"status":"ok"}
[ ] OPTIONS request returns 200 (not 404)
[ ] POST /skills/extract works
[ ] VITE_AI_URL updated in Vercel
[ ] AI_SERVICE_URL updated in Backend
[ ] Both services redeployed

========================================

