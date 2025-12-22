# Next Steps - Complete Deployment

## ✅ Current Status

- ✅ MongoDB Atlas cluster "RizeOS" is deployed
- ✅ Cluster is running (AWS Mumbai region)
- ✅ Backend build successful on Railway
- ⚠️ MongoDB connection needs TLS parameter

---

## Step 1: Verify MongoDB Network Access

1. **In MongoDB Atlas:**
   - Click **"Security"** in the left sidebar
   - Click **"Network Access"**
   - Verify you have **"Allow Access from Anywhere"** (0.0.0.0/0)
   - If not, click **"+ Add IP Address"** → **"Allow Access from Anywhere"**

---

## Step 2: Get Connection String

1. **In MongoDB Atlas:**
   - Click **"Database"** in the left sidebar
   - Click **"Connect"** button on your RizeOS cluster
   - Choose **"Connect your application"**
   - Driver: **Go**
   - Copy the connection string

2. **Format it correctly:**
   ```
   mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
   ```
   
   **Important:**
   - Password must be URL-encoded: `Qwertyuiop@123#` → `Qwertyuiop%40123%23`
   - Add database name: `/rizeos` (before the `?`)
   - Add TLS: `&tls=true` (at the end)

---

## Step 3: Update Railway Backend

1. **Go to Railway:**
   - Open your **Backend Service**
   - Click **Variables** tab
   - Find `MONGO_URI`

2. **Update the value:**
   ```
   mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
   ```

3. **Save:**
   - Railway will automatically redeploy
   - Check **Logs** tab to verify connection

---

## Step 4: Verify Connection

### Check Railway Logs:

After redeploy, you should see:
```
✅ Connected to MongoDB successfully
```

Instead of:
```
❌ failed to connect to mongo: tls: internal error
```

### Test Health Endpoint:

Once connected, test your backend:
```bash
curl https://your-backend-service.railway.app/api/health
```

Expected response:
```json
{"status":"ok"}
```

---

## Step 5: Deploy AI Service (If Not Done)

1. **Create new service in Railway:**
   - Same project
   - Root Directory: `ai-service`
   - Build Command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Add environment variables:**
   ```
   PORT=8000
   MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
   SPACY_MODEL=en_core_web_sm
   ```

3. **Get AI service URL:**
   - Settings → Domains
   - Copy the URL

4. **Update Backend:**
   - Backend Service → Variables
   - Update `AI_SERVICE_URL` with AI service URL

---

## Step 6: Deploy Frontend (Vercel)

1. **Go to Vercel:**
   - Import your GitHub repository
   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)

2. **Add environment variables:**
   ```
   VITE_API_URL=https://your-backend-service.railway.app/api
   VITE_AI_URL=https://your-ai-service.railway.app
   ```

3. **Deploy:**
   - Vercel will build and deploy automatically
   - Get your frontend URL

4. **Update Backend CORS:**
   - Railway → Backend Service → Variables
   - Update `CORS_ALLOWED_ORIGINS` with your Vercel URL

---

## Step 7: Test Everything

### Backend:
- [ ] Health endpoint works
- [ ] Can register user
- [ ] Can login
- [ ] JWT token works

### AI Service:
- [ ] Health endpoint works
- [ ] Skill extraction works
- [ ] Match scoring works

### Frontend:
- [ ] Home page loads
- [ ] Can register
- [ ] Can login
- [ ] Dashboard accessible
- [ ] API calls work (check browser console)

### MongoDB:
- [ ] Connection successful
- [ ] Can create users
- [ ] Can create jobs
- [ ] Data persists

---

## 🎯 Quick Checklist

- [ ] MongoDB Network Access: 0.0.0.0/0
- [ ] Backend MONGO_URI updated with `&tls=true`
- [ ] Backend connected to MongoDB (check logs)
- [ ] AI Service deployed
- [ ] Backend AI_SERVICE_URL updated
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set
- [ ] Backend CORS_ALLOWED_ORIGINS updated
- [ ] All services communicating
- [ ] Test authentication
- [ ] Test payments
- [ ] Test AI features

---

## 🆘 Troubleshooting

### MongoDB Connection Still Failing?

1. **Check Network Access:**
   - MongoDB Atlas → Security → Network Access
   - Must have 0.0.0.0/0 or Railway IPs

2. **Check Connection String:**
   - Password must be URL-encoded
   - Must include `/rizeos` database name
   - Must include `&tls=true`

3. **Check Railway Logs:**
   - Look for specific error messages
   - Verify MONGO_URI is set correctly

### Backend Not Starting?

1. **Check Environment Variables:**
   - All required variables set?
   - MONGO_URI correct?
   - JWT_SECRET set?

2. **Check Logs:**
   - Railway → Backend Service → Logs
   - Look for error messages

---

## 📝 Current MongoDB Info

From your screenshot:
- **Cluster Name:** RizeOS
- **Region:** AWS Mumbai (ap-south-1)
- **Version:** 8.0.17
- **Type:** Replica Set - 3 nodes
- **Status:** Running ✅

**Connection String Format:**
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
```

---

**You're almost there!** Just update the MONGO_URI in Railway and you should be good to go! 🚀

