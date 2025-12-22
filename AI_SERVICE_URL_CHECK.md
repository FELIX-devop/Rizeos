# AI Service URL Configuration Check

## Current Configuration

All files are set to:
```
AI_SERVICE_URL=https://rizeos-production-7106.up.railway.app
```

### Files with AI_SERVICE_URL:

1. ✅ `railway-backend-variables.json`
2. ✅ `RAILWAY_ENV_VARS.txt`
3. ✅ `railway-backend-variables-formatted.json`

---

## URL Status Check

### Test the Current URL:
```bash
curl https://rizeos-production-7106.up.railway.app/
```

### Expected Responses:

**✅ If Service is Running:**
```json
{"status":"ok"}
```

**❌ If Service is Not Running:**
```json
{"status":"error","code":404,"message":"Application not found"}
```

---

## If You Created a NEW AI Service

If you created a **new** AI service in Railway, you need to:

1. **Get the new URL:**
   - Railway → New AI Service → Settings → Networking
   - Copy the **Public Domain** URL

2. **Update all configuration files:**
   - `railway-backend-variables.json`
   - `RAILWAY_ENV_VARS.txt`
   - `railway-backend-variables-formatted.json`

3. **Update Railway Backend:**
   - Backend Service → Variables → `AI_SERVICE_URL`
   - Update with new URL

---

## Quick Update Script

If you have a new URL, run:

```bash
# Replace NEW_URL with your actual new URL
NEW_URL="https://your-new-ai-service.up.railway.app"

# Update JSON files
sed -i '' "s|https://rizeos-production-7106.up.railway.app|$NEW_URL|g" railway-backend-variables.json
sed -i '' "s|https://rizeos-production-7106.up.railway.app|$NEW_URL|g" railway-backend-variables-formatted.json

# Update text file
sed -i '' "s|https://rizeos-production-7106.up.railway.app|$NEW_URL|g" RAILWAY_ENV_VARS.txt
```

---

## Verification Steps

1. **Test Current URL:**
   ```bash
   curl https://rizeos-production-7106.up.railway.app/
   ```

2. **If 404, check Railway:**
   - Is the service deployed?
   - Is it showing "Online"?
   - What's the actual URL in Railway?

3. **If you have a new service:**
   - Get the new URL from Railway
   - Update all files
   - Update Railway backend variables

---

## Summary

- ✅ All files are consistently using: `https://rizeos-production-7106.up.railway.app`
- ⚠️ If this URL returns 404, the service might not be running or you need a new URL
- 🔄 If you created a NEW service, update all files with the new URL

