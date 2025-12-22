# Deployment Checklist

Use this checklist to ensure all steps are completed correctly.

---

## Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] No hardcoded localhost URLs (except fallbacks)
- [ ] Environment variables documented

---

## Step 1: MongoDB Atlas

- [ ] Account created
- [ ] M0 Free cluster created
- [ ] Database user created (username + password saved)
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Connection string copied:
  ```
  mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/rizeos?retryWrites=true&w=majority
  ```

---

## Step 2: Backend (Railway)

- [ ] Railway account created
- [ ] New project created
- [ ] Backend service added
- [ ] Root directory set to `backend`
- [ ] Build command: `cd backend && go build -o server ./cmd/server`
- [ ] Start command: `./server`
- [ ] Environment variables set:
  - [ ] `PORT=8080`
  - [ ] `MONGO_URI` (from Step 1)
  - [ ] `JWT_SECRET` (strong, random, 32+ chars)
  - [ ] `ADMIN_WALLET_ADDRESS`
  - [ ] `POLYGON_RPC_URL`
  - [ ] `PLATFORM_FEE_MATIC=0.1`
  - [ ] `ADMIN_SIGNUP_CODE`
  - [ ] `CORS_ALLOWED_ORIGINS` (update after Step 4)
  - [ ] `AI_SERVICE_URL` (update after Step 3)
- [ ] Service deployed successfully
- [ ] Backend URL saved: `https://your-backend-service.railway.app`
- [ ] Health check passed: `curl https://your-backend-service.railway.app/api/health`

---

## Step 3: AI Service (Railway)

- [ ] AI service added to same Railway project
- [ ] Root directory set to `ai-service`
- [ ] Build command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
- [ ] Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables set:
  - [ ] `PORT=8000`
  - [ ] `MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2` (optional)
  - [ ] `SPACY_MODEL=en_core_web_sm` (optional)
- [ ] Service deployed successfully (first deploy takes longer)
- [ ] AI service URL saved: `https://your-ai-service.railway.app`
- [ ] Health check passed: `curl https://your-ai-service.railway.app/`
- [ ] Backend `AI_SERVICE_URL` updated and redeployed

---

## Step 4: Frontend (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Build settings verified:
  - [ ] Framework: Vite
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
- [ ] Environment variables set:
  - [ ] `VITE_API_URL=https://your-backend-service.railway.app/api`
  - [ ] `VITE_AI_URL=https://your-ai-service.railway.app`
- [ ] Project deployed successfully
- [ ] Frontend URL saved: `https://your-app.vercel.app`
- [ ] Backend `CORS_ALLOWED_ORIGINS` updated with Vercel domain
- [ ] Backend redeployed

---

## Step 5: Post-Deployment Testing

### Authentication
- [ ] Home page loads
- [ ] Register page works
- [ ] Login page works
- [ ] User can register
- [ ] User can login
- [ ] JWT token stored in localStorage
- [ ] Protected routes accessible after login

### Backend API
- [ ] Health endpoint: `GET /api/health` returns `{"status":"ok"}`
- [ ] Config endpoint: `GET /api/config/public` returns config
- [ ] Register endpoint: `POST /api/auth/register` works
- [ ] Login endpoint: `POST /api/auth/login` works

### AI Service
- [ ] Health endpoint: `GET /` returns `{"status":"ok"}`
- [ ] Docs available: `GET /docs` loads
- [ ] Skill extraction: `POST /skills/extract` works
- [ ] Match scoring: `POST /match` works

### Frontend Features
- [ ] Dashboard loads after login
- [ ] Job listing displays
- [ ] Job details page works
- [ ] Profile page works
- [ ] No console errors

### Payments (Recruiter)
- [ ] Payment button appears
- [ ] MetaMask connects
- [ ] Transaction sent successfully
- [ ] Payment verified on backend
- [ ] Job can be created after payment

### AI Features (Job Seeker)
- [ ] Resume upload works
- [ ] Skills extracted
- [ ] Fitment scores visible (if premium)
- [ ] Job application works

### Messaging
- [ ] Messages can be sent
- [ ] Inbox displays messages
- [ ] Unread count updates

---

## Final Verification

- [ ] All services running
- [ ] No errors in logs
- [ ] All features working
- [ ] Environment variables secure
- [ ] CORS configured correctly
- [ ] MongoDB accessible
- [ ] Payments working
- [ ] AI features working

---

## Production Hardening (Optional)

- [ ] MongoDB IP access restricted to Railway IPs
- [ ] Strong JWT secret (32+ chars, random)
- [ ] CORS only allows Vercel domain
- [ ] Admin signup code is secret
- [ ] All secrets in Railway/Vercel (not in code)
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Backup strategy in place

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Backend URL:** _______________  
**AI Service URL:** _______________  
**Frontend URL:** _______________

