# Railway Backend Service - Environment Variables

## Complete List of Required Variables

Copy these variables into Railway → Backend Service → Variables tab:

---

### 1. Server Configuration
```
PORT=8080
```
**Note:** Railway may auto-set this, but include it for clarity.

---

### 2. Database (MongoDB Atlas)
```
MONGO_URI=mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
```
**Status:** ✅ Already configured (URL-encoded password)

---

### 3. Security
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
ADMIN_SIGNUP_CODE=owner-secret
```
**⚠️ Important:**
- `JWT_SECRET`: Generate a strong random string (32+ characters)
  - Use: `openssl rand -hex 32` or online generator
  - **DO NOT** use the default "change_me"
- `ADMIN_SIGNUP_CODE`: Secret code for admin registration

---

### 4. Payment Configuration (REQUIRED FOR PAYMENTS)
```
ADMIN_WALLET_ADDRESS=0x7810dF8A3b2Efe8eDD502621b451581C5602eFD
POLYGON_RPC_URL=https://sepolia.infura.io/v3/de11139a237947098e16a7eff66b3fd1
PLATFORM_FEE_MATIC=0.1
```
**Status:** ✅ All configured
- `ADMIN_WALLET_ADDRESS`: Your wallet that receives payments
- `POLYGON_RPC_URL`: Sepolia testnet RPC (works for Sepolia)
- `PLATFORM_FEE_MATIC`: Minimum payment amount (0.1 ETH)

---

### 5. CORS (Cross-Origin Resource Sharing)
```
CORS_ALLOWED_ORIGINS=*
```
**⚠️ Current:** Allows all origins (development)
**For Production:** After deploying frontend, change to:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```
Or multiple origins (comma-separated):
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-app.vercel.app
```

---

### 6. AI Service URL
```
AI_SERVICE_URL=https://your-ai-service.railway.app
```
**⚠️ Action Required:**
- Deploy AI service first
- Get the Railway URL (e.g., `https://ai-service-production.up.railway.app`)
- Replace `your-ai-service.railway.app` with actual URL

---

## Quick Copy-Paste Template

Copy this entire block into Railway Variables:

```env
PORT=8080

MONGO_URI=mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true

JWT_SECRET=GENERATE_A_SECURE_RANDOM_STRING_32_CHARS_MIN
ADMIN_SIGNUP_CODE=owner-secret

ADMIN_WALLET_ADDRESS=0x7810dF8A3b2Efe8eDD502621b451581C5602eFD
POLYGON_RPC_URL=https://sepolia.infura.io/v3/de11139a237947098e16a7eff66b3fd1
PLATFORM_FEE_MATIC=0.1

CORS_ALLOWED_ORIGINS=*

AI_SERVICE_URL=https://your-ai-service.railway.app
```

---

## Setup Order

1. ✅ **MongoDB Atlas** - Already configured
2. ✅ **Payment Config** - Already configured
3. ⚠️ **JWT_SECRET** - Generate and add
4. ⚠️ **AI_SERVICE_URL** - Add after AI service deployment
5. ⚠️ **CORS_ALLOWED_ORIGINS** - Update after frontend deployment

---

## How to Add in Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **Backend** service
3. Click **Variables** tab
4. Click **+ New Variable** for each variable
5. Enter **Key** and **Value**
6. Click **Add**
7. Railway will automatically redeploy

---

## Verification

After adding all variables, verify:

1. **Health Check:**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Config Check:**
   ```bash
   curl https://your-backend.railway.app/api/config/public
   ```
   Should return wallet address and platform fee

3. **Check Logs:**
   - Railway → Backend → Deployments → View Logs
   - Should see: `Listening and serving HTTP on :8080`
   - No errors about missing variables

---

## Missing Variables Error

If you see errors like:
- `"admin wallet or RPC not configured"` → Check `ADMIN_WALLET_ADDRESS` and `POLYGON_RPC_URL`
- `"failed to connect to mongo"` → Check `MONGO_URI`
- `"JWT secret too short"` → Check `JWT_SECRET` is 32+ characters

---

**Last Updated:** 2024

