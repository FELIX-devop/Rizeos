# RizeOS Portal - Cloud Deployment Guide

## 🎯 Deployment Architecture

```
Frontend (Vite + React)  →  Vercel
Backend (Go + Gin)       →  Railway
AI Service (FastAPI)     →  Railway
Database                 →  MongoDB Atlas
```

---

## 📋 Prerequisites

- [ ] GitHub repository with code pushed
- [ ] MongoDB Atlas account (free tier available)
- [ ] Railway account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] MetaMask wallet with Polygon Sepolia testnet configured

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **M0 Free** tier
5. Choose cloud provider and region (closest to your users)
6. Click **"Create"**

### 1.2 Create Database User

1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Username: `rizeos-admin` (or your choice)
4. Password: Generate secure password (save it!)
5. Database User Privileges: **Atlas admin** (or **Read and write to any database**)
6. Click **"Add User"**

### 1.3 Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (for development)
   - IP Address: `0.0.0.0/0`
3. Click **"Confirm"**

**⚠️ Production:** Restrict to Railway IPs only for security

### 1.4 Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Driver: **Go**
4. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name: `/rizeos` at the end
7. Final URI:
   ```
   mongodb+srv://rizeos-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rizeos?retryWrites=true&w=majority
   ```

**✅ Save this URI - you'll need it for Railway backend!**

---

## Step 2: Backend Deployment (Railway)

### 2.1 Create Railway Project

1. Go to [Railway](https://railway.app)
2. Sign up or log in (use GitHub)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository
6. Railway will detect the project

### 2.2 Configure Backend Service

1. **Select Root Directory:**
   - Click on the service
   - Go to **Settings** → **Root Directory**
   - Set to: `backend`

2. **Set Build Command:**
   - Go to **Settings** → **Build Command**
   - Set to: `cd backend && go build -o server ./cmd/server`

3. **Set Start Command:**
   - Go to **Settings** → **Start Command**
   - Set to: `./server`

4. **Configure Environment Variables:**
   - Go to **Variables** tab
   - Add the following:

   ```env
   PORT=8080
   MONGO_URI=mongodb+srv://rizeos-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rizeos?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this-in-production
   ADMIN_WALLET_ADDRESS=0xYourAdminWalletAddress
   POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   PLATFORM_FEE_MATIC=0.1
   ADMIN_SIGNUP_CODE=your-admin-secret-code
   CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   AI_SERVICE_URL=https://your-ai-service.railway.app
   ```

   **⚠️ Important:**
   - Replace `YOUR_PASSWORD` with your MongoDB password
   - Replace `YOUR_ALCHEMY_KEY` with your Alchemy API key
   - Replace `your-vercel-app.vercel.app` with your Vercel domain (update after Step 4)
   - Replace `your-ai-service.railway.app` with your AI service domain (update after Step 3)

5. **Deploy:**
   - Railway will automatically deploy
   - Wait for build to complete
   - Check **Deployments** tab for logs

### 2.3 Get Backend URL

1. Go to **Settings** → **Domains**
2. Railway provides a default domain: `your-backend-service.railway.app`
3. **Save this URL** - you'll need it for:
   - Frontend `VITE_API_URL`
   - AI service CORS (if needed)

### 2.4 Verify Backend

Test the health endpoint:
```bash
curl https://your-backend-service.railway.app/api/health
```

Expected response:
```json
{"status":"ok"}
```

---

## Step 3: AI Service Deployment (Railway)

### 3.1 Create AI Service

1. In the same Railway project, click **"New Service"**
2. Select **"Deploy from GitHub repo"**
3. Choose the same repository
4. Railway will detect the project

### 3.2 Configure AI Service

1. **Select Root Directory:**
   - Go to **Settings** → **Root Directory**
   - Set to: `ai-service`

2. **Set Build Command:**
   - Go to **Settings** → **Build Command**
   - Set to: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`

3. **Set Start Command:**
   - Go to **Settings** → **Start Command**
   - Set to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Configure Environment Variables:**
   - Go to **Variables** tab
   - Add:

   ```env
   PORT=8000
   MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
   SPACY_MODEL=en_core_web_sm
   ```

5. **Deploy:**
   - Railway will automatically deploy
   - **First deployment takes longer** (downloads ML models ~500MB)
   - Check **Deployments** tab for progress

### 3.3 Get AI Service URL

1. Go to **Settings** → **Domains**
2. Railway provides: `your-ai-service.railway.app`
3. **Save this URL** - you'll need it for:
   - Backend `AI_SERVICE_URL`
   - Frontend `VITE_AI_URL`

### 3.4 Verify AI Service

Test the health endpoint:
```bash
curl https://your-ai-service.railway.app/
```

Expected response:
```json
{"status":"ok"}
```

Test the docs:
```bash
# Open in browser
https://your-ai-service.railway.app/docs
```

### 3.5 Update Backend Environment

1. Go back to **Backend Service** → **Variables**
2. Update `AI_SERVICE_URL`:
   ```
   AI_SERVICE_URL=https://your-ai-service.railway.app
   ```
3. Railway will automatically redeploy

---

## Step 4: Frontend Deployment (Vercel)

### 4.1 Import Project

1. Go to [Vercel](https://vercel.com)
2. Sign up or log in (use GitHub)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Vercel will detect Vite project

### 4.2 Configure Build Settings

1. **Framework Preset:** Vite (auto-detected)
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `dist` (auto-detected)
5. **Install Command:** `npm install` (auto-detected)

### 4.3 Configure Environment Variables

1. Go to **Environment Variables**
2. Add:

   ```env
   VITE_API_URL=https://your-backend-service.railway.app/api
   VITE_AI_URL=https://your-ai-service.railway.app
   ```

   **⚠️ Important:**
   - Replace `your-backend-service.railway.app` with your actual Railway backend URL
   - Replace `your-ai-service.railway.app` with your actual Railway AI service URL
   - **No trailing slashes!**

3. **Environment:** Select **Production**, **Preview**, and **Development**

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Vercel provides a domain: `your-app.vercel.app`

### 4.5 Verify Frontend

1. Open `https://your-app.vercel.app`
2. Test:
   - Home page loads
   - Login/Register works
   - Dashboard accessible after login
   - API calls work (check browser console)

### 4.6 Update Backend CORS

1. Go back to **Railway Backend** → **Variables**
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

---

## Step 5: Post-Deployment Configuration

### 5.1 Verify All Services

**Backend Health:**
```bash
curl https://your-backend-service.railway.app/api/health
```

**AI Service Health:**
```bash
curl https://your-ai-service.railway.app/
```

**Frontend:**
- Open `https://your-app.vercel.app`
- Check browser console for errors

### 5.2 Test Authentication

1. Register a new user
2. Login
3. Verify JWT token is stored
4. Access protected routes

### 5.3 Test AI Features

1. Upload a resume (Job Seeker)
2. Verify skills are extracted
3. Apply to a job
4. Verify fitment score appears (if premium)

### 5.4 Test Payments

1. Login as Recruiter
2. Click "Pay 0.1 MATIC"
3. Connect MetaMask
4. Confirm transaction on Polygon Sepolia
5. Verify payment is processed

### 5.5 Test Messaging

1. Send message (Recruiter → Admin)
2. Check inbox
3. Verify messages appear

---

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas Network Access (0.0.0.0/0)
- Verify database user credentials

**CORS Errors:**
- Verify `CORS_ALLOWED_ORIGINS` includes Vercel domain
- Check for trailing slashes
- Restart backend service

**AI Service Not Reachable:**
- Verify `AI_SERVICE_URL` is correct
- Check AI service is deployed and running
- Test AI service health endpoint

### AI Service Issues

**Model Download Fails:**
- Check Railway logs
- Verify internet connectivity during build
- Retry deployment

**Slow Response:**
- First request loads model (~500MB)
- Subsequent requests are faster
- Consider model caching

### Frontend Issues

**API Calls Fail:**
- Verify `VITE_API_URL` is correct
- Check browser console for errors
- Verify backend CORS allows Vercel domain

**Build Fails:**
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Check Node.js version compatibility

---

## 📊 Environment Variables Summary

### Backend (Railway)

| Variable | Example | Required |
|----------|---------|----------|
| `PORT` | `8080` | ✅ |
| `MONGO_URI` | `mongodb+srv://...` | ✅ |
| `JWT_SECRET` | `secure-secret-32-chars` | ✅ |
| `ADMIN_WALLET_ADDRESS` | `0x...` | ✅ |
| `POLYGON_RPC_URL` | `https://polygon-mumbai...` | ✅ |
| `PLATFORM_FEE_MATIC` | `0.1` | ✅ |
| `ADMIN_SIGNUP_CODE` | `admin-secret` | ✅ |
| `CORS_ALLOWED_ORIGINS` | `https://app.vercel.app` | ✅ |
| `AI_SERVICE_URL` | `https://ai.railway.app` | ✅ |

### AI Service (Railway)

| Variable | Example | Required |
|----------|---------|----------|
| `PORT` | `8000` | ✅ |
| `MODEL_NAME` | `sentence-transformers/...` | Optional |
| `SPACY_MODEL` | `en_core_web_sm` | Optional |

### Frontend (Vercel)

| Variable | Example | Required |
|----------|---------|----------|
| `VITE_API_URL` | `https://backend.railway.app/api` | ✅ |
| `VITE_AI_URL` | `https://ai.railway.app` | ✅ |

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Backend deployed on Railway
- [ ] Backend environment variables set
- [ ] Backend health endpoint working
- [ ] AI service deployed on Railway
- [ ] AI service environment variables set
- [ ] AI service health endpoint working
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set
- [ ] CORS configured correctly
- [ ] All services communicating
- [ ] Authentication working
- [ ] Payments working
- [ ] AI features working
- [ ] Messaging working

---

## 🚀 Production Recommendations

### Security

1. **MongoDB Atlas:**
   - Restrict IP access to Railway IPs only
   - Use strong database passwords
   - Enable MongoDB Atlas encryption

2. **JWT Secret:**
   - Use strong, random secret (min 32 chars)
   - Never commit to git
   - Rotate periodically

3. **CORS:**
   - Only allow your Vercel domain
   - Remove wildcard origins

4. **Environment Variables:**
   - Use Railway/Vercel secrets
   - Never expose in logs
   - Rotate secrets regularly

### Performance

1. **MongoDB:**
   - Create indexes on frequently queried fields
   - Monitor query performance
   - Upgrade to M2+ for production

2. **Railway:**
   - Monitor resource usage
   - Upgrade plan if needed
   - Enable auto-scaling

3. **Vercel:**
   - Enable CDN caching
   - Optimize images
   - Use edge functions if needed

### Monitoring

1. **Railway:**
   - Check deployment logs
   - Monitor service health
   - Set up alerts

2. **Vercel:**
   - Monitor build times
   - Check analytics
   - Review error logs

3. **MongoDB Atlas:**
   - Monitor cluster metrics
   - Set up alerts
   - Review slow queries

---

## 📝 Support

If you encounter issues:

1. Check service logs (Railway/Vercel)
2. Verify environment variables
3. Test endpoints individually
4. Check MongoDB Atlas connection
5. Review browser console for frontend errors

---

**Last Updated:** 2024  
**Status:** Production Ready

