# Environment Variables Reference

Quick reference for all environment variables needed for deployment.

---

## Backend (Railway)

```env
# Server Configuration
PORT=8080

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rizeos?retryWrites=true&w=majority

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this-in-production
ADMIN_SIGNUP_CODE=your-admin-secret-code

# Blockchain
ADMIN_WALLET_ADDRESS=0xYourAdminWalletAddress
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PLATFORM_FEE_MATIC=0.1

# CORS
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

# AI Service
AI_SERVICE_URL=https://your-ai-service.railway.app
```

**⚠️ Important Notes:**
- `MONGO_URI`: Replace `<username>`, `<password>`, and cluster URL with your MongoDB Atlas credentials
- `JWT_SECRET`: Use a strong, random secret (minimum 32 characters)
- `POLYGON_RPC_URL`: Get from [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/)
- `CORS_ALLOWED_ORIGINS`: Update after deploying frontend to Vercel
- `AI_SERVICE_URL`: Update after deploying AI service to Railway

---

## AI Service (Railway)

```env
# Server Configuration
PORT=8000

# ML Models (Optional - defaults provided)
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
```

**⚠️ Important Notes:**
- `PORT`: Railway automatically sets this, but include it for clarity
- `MODEL_NAME`: Default model is already set in code
- `SPACY_MODEL`: Default model is already set in code

---

## Frontend (Vercel)

```env
# API Endpoints
VITE_API_URL=https://your-backend-service.railway.app/api
VITE_AI_URL=https://your-ai-service.railway.app
```

**⚠️ Important Notes:**
- `VITE_API_URL`: Must include `/api` at the end
- `VITE_AI_URL`: No trailing slash
- Both must use `https://` (not `http://`)
- Update after deploying backend and AI service to Railway

---

## Environment Variable Setup Order

1. **MongoDB Atlas** → Get `MONGO_URI`
2. **Railway AI Service** → Get `AI_SERVICE_URL`
3. **Railway Backend** → Set all backend variables (use AI service URL from step 2)
4. **Vercel Frontend** → Set frontend variables (use backend URL from step 3)
5. **Update Backend CORS** → Add Vercel domain to `CORS_ALLOWED_ORIGINS`

---

## Quick Copy-Paste Template

### Backend (Railway)
```env
PORT=8080
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/rizeos?retryWrites=true&w=majority
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_32_CHARS
ADMIN_WALLET_ADDRESS=0xYOUR_ADMIN_WALLET
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
PLATFORM_FEE_MATIC=0.1
ADMIN_SIGNUP_CODE=your-admin-secret
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
AI_SERVICE_URL=https://your-ai-service.railway.app
```

### AI Service (Railway)
```env
PORT=8000
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend-service.railway.app/api
VITE_AI_URL=https://your-ai-service.railway.app
```

---

## Security Checklist

- [ ] `JWT_SECRET` is strong and random (32+ chars)
- [ ] `ADMIN_SIGNUP_CODE` is secret and unique
- [ ] `MONGO_URI` password is strong
- [ ] `CORS_ALLOWED_ORIGINS` only includes your Vercel domain
- [ ] No environment variables committed to git
- [ ] All secrets stored in Railway/Vercel secrets (not in code)

---

## Testing Environment Variables

### Backend
```bash
curl https://your-backend-service.railway.app/api/health
# Should return: {"status":"ok"}
```

### AI Service
```bash
curl https://your-ai-service.railway.app/
# Should return: {"status":"ok"}
```

### Frontend
- Open browser console
- Check for API errors
- Verify `VITE_API_URL` and `VITE_AI_URL` are loaded correctly

---

**Last Updated:** 2024

