# Final MongoDB Connection String for Railway

## ✅ Verified Database User

Your MongoDB Atlas user is correctly configured:
- **Username:** `rizeos_user`
- **Role:** `atlasAdmin@admin` ✅
- **Authentication:** SCRAM ✅

---

## 🔧 Connection String for Railway

### Copy This to Railway → Variables → MONGO_URI:

```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
```

**Important Notes:**
- ✅ Password is URL-encoded: `Qwertyuiop@123#` → `Qwertyuiop%40123%23`
- ✅ Database name included: `/rizeos`
- ✅ No `&tls=true` needed (mongodb+srv:// handles it automatically)
- ✅ Connection options included

---

## 📋 Step-by-Step Update

1. **Go to Railway:**
   - Open your **Backend Service**
   - Click **Variables** tab

2. **Find MONGO_URI:**
   - Look for the `MONGO_URI` variable
   - Click **Edit** or **Update**

3. **Paste This Value:**
   ```
   mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
   ```

4. **Save:**
   - Railway will automatically redeploy
   - Wait for deployment to complete

5. **Check Logs:**
   - Go to **Logs** tab
   - Should see: `✅ Connected to MongoDB successfully`

---

## ✅ Verification Checklist

- [x] Database user exists: `rizeos_user`
- [x] User has correct role: `atlasAdmin@admin`
- [x] Password is known: `Qwertyuiop@123#`
- [x] Go code updated with better TLS handling
- [ ] **MONGO_URI updated in Railway** ← DO THIS NOW
- [ ] Network Access configured (0.0.0.0/0)
- [ ] Connection successful (check logs)

---

## 🔍 If Connection Still Fails

### Check Network Access:

1. **In MongoDB Atlas:**
   - Click **"Network Access"** in the left sidebar
   - Verify you have **"Allow Access from Anywhere"** (0.0.0/0)
   - If not, click **"+ ADD IP ADDRESS"** → **"Allow Access from Anywhere"**

### Check Railway Logs:

After updating MONGO_URI, check Railway logs for:
- ✅ Success: `Connected to MongoDB successfully`
- ❌ Error: Look for specific error message

### Common Issues:

1. **Network Access Not Configured:**
   - Solution: Add 0.0.0.0/0 in MongoDB Atlas Network Access

2. **Password Encoding:**
   - Verify: `Qwertyuiop@123#` → `Qwertyuiop%40123%23`
   - `@` = `%40`
   - `#` = `%23`

3. **Database Name:**
   - Must include `/rizeos` in connection string
   - Should be: `...mongodb.net/rizeos?retryWrites=...`

---

## 🎯 Quick Test

After updating, test your backend:

```bash
curl https://your-backend-service.railway.app/api/health
```

**Expected Response:**
```json
{"status":"ok"}
```

If you get this, MongoDB connection is working! 🎉

---

**Everything is set up correctly. Just update the MONGO_URI in Railway and you're good to go!** 🚀

