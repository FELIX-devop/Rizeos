# MongoDB TLS Connection Fix - Complete Solution

## 🔴 Problem

Still getting TLS errors even after adding `&tls=true`:
```
remote error: tls: internal error
context deadline exceeded
```

## ✅ Complete Solution

We need to fix BOTH the connection string AND the Go code.

---

## Step 1: Update Connection String (Railway)

### Current (May not work):
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
```

### Try These Options:

#### Option 1: Remove TLS parameter (Let driver handle it)
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
```

#### Option 2: Use SSL instead of TLS
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&ssl=true
```

#### Option 3: Minimal connection string
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos
```

---

## Step 2: Update Go Code (Already Done)

I've updated `backend/internal/database/mongo.go` to:
- Increase connection timeouts (30 seconds)
- Explicitly configure TLS
- Better error handling

**The code has been updated and committed.**

---

## Step 3: Verify MongoDB Atlas Settings

### Network Access:
1. Go to MongoDB Atlas → **Security** → **Network Access**
2. Make sure you have:
   - **"Allow Access from Anywhere"** (0.0.0.0/0)
   - OR Railway's specific IP addresses

### Database User:
1. Go to **Security** → **Database Access**
2. Verify user `rizeos_user` exists
3. Verify password is correct
4. User should have **"Atlas admin"** or **"Read and write to any database"** role

---

## Step 4: Test Connection String Format

### Try This Connection String (Recommended):

```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
```

**Key Points:**
- ✅ Password is URL-encoded
- ✅ Database name `/rizeos` is included
- ✅ No TLS parameter (Go driver handles it automatically for `mongodb+srv://`)
- ✅ Connection options included

---

## Step 5: Update Railway and Redeploy

1. **Go to Railway:**
   - Backend Service → **Variables** tab
   - Update `MONGO_URI` to:
     ```
     mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
     ```

2. **Save:**
   - Railway will automatically redeploy
   - The updated Go code will handle TLS properly

3. **Check Logs:**
   - Railway → Backend Service → **Logs** tab
   - Should see: `✅ Connected to MongoDB successfully`

---

## Why This Should Work

### The `mongodb+srv://` Protocol:
- **Automatically uses TLS** - No need for `&tls=true`
- **Handles DNS SRV records** - Better for MongoDB Atlas
- **Go driver handles TLS automatically** - We just need to configure timeouts

### Updated Go Code:
- **Longer timeouts** - 30 seconds (was 10)
- **Explicit TLS config** - Uses default TLS settings
- **Better error handling** - More informative errors

---

## Alternative: Test Connection Locally

If Railway still fails, test the connection string locally:

```bash
# Install MongoDB shell
brew install mongosh  # macOS
# or
npm install -g mongosh

# Test connection
mongosh "mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos"
```

If this works locally but not on Railway, it's likely a network/firewall issue.

---

## Troubleshooting

### Still Getting TLS Errors?

1. **Check MongoDB Atlas Status:**
   - Make sure cluster is fully deployed (not still deploying)
   - Check cluster status in Atlas dashboard

2. **Verify Network Access:**
   - Must have 0.0.0.0/0 or Railway IPs
   - Wait 2-3 minutes after adding IPs (propagation delay)

3. **Check Connection String:**
   - Password must be URL-encoded
   - Database name must be included
   - No typos in username/cluster name

4. **Try Different Connection String Format:**
   - Remove all query parameters: `mongodb+srv://user:pass@cluster.net/db`
   - Add only essential: `mongodb+srv://user:pass@cluster.net/db?retryWrites=true&w=majority`

5. **Check Railway Logs:**
   - Look for specific error messages
   - Verify MONGO_URI is set correctly

---

## Quick Fix Summary

1. ✅ **Code Updated:** `backend/internal/database/mongo.go` (committed)
2. ⏳ **Update Railway:** Change `MONGO_URI` to (remove `&tls=true`):
   ```
   mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
   ```
3. ⏳ **Verify Network Access:** MongoDB Atlas → 0.0.0.0/0
4. ⏳ **Redeploy:** Railway will auto-redeploy
5. ⏳ **Check Logs:** Should see successful connection

---

**The Go code is already fixed. Just update the MONGO_URI in Railway (remove `&tls=true`) and it should work!** 🚀

