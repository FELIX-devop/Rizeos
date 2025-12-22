# MongoDB Connection Fix - TLS Error

## 🔴 Problem

Your backend is built successfully, but it can't connect to MongoDB Atlas:

```
failed to connect to mongo: server selection error: context deadline exceeded
remote error: tls: internal error
```

## ✅ Solution

The MongoDB connection string needs to include TLS parameters. Here's the fix:

---

## Step 1: Update MongoDB Connection String

### Current Connection String (Incorrect):
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
```

### Corrected Connection String (Add TLS):
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
```

**Or use this (recommended):**
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true&tlsInsecure=false
```

---

## Step 2: Update Railway Environment Variable

1. **Go to Railway:**
   - Open your **Backend Service**
   - Click **Variables** tab
   - Find `MONGO_URI`

2. **Update the Value:**
   - Replace the current `MONGO_URI` with:
   ```
   mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
   ```

3. **Save:**
   - Railway will automatically redeploy
   - Check logs to verify connection

---

## Step 3: Verify MongoDB Atlas Network Access

1. **Go to MongoDB Atlas:**
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com)
   - Select your cluster
   - Go to **Network Access**

2. **Check IP Whitelist:**
   - Make sure you have **one of these**:
     - `0.0.0.0/0` (allows all IPs - for development)
     - OR Railway's IP addresses (for production)

3. **If needed, add IP:**
   - Click **"Add IP Address"**
   - For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production: Add Railway's specific IPs

---

## Alternative: Check Connection String Format

If the TLS parameter doesn't work, try this format:

```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&ssl=true
```

Some MongoDB drivers use `ssl=true` instead of `tls=true`.

---

## Complete Connection String Options

### Option 1: With TLS (Recommended)
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
```

### Option 2: With SSL
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&ssl=true
```

### Option 3: Minimal (Let driver handle TLS)
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos
```

---

## Verify Connection

After updating, check Railway logs. You should see:

**Success:**
```
✅ Connected to MongoDB successfully
```

**Still Failing:**
- Check MongoDB Atlas Network Access
- Verify password is URL-encoded correctly
- Check if database name is correct (`rizeos`)

---

## Troubleshooting

### Error: "tls: internal error"

**Causes:**
1. Missing TLS parameter in connection string
2. Network access not configured
3. Incorrect password encoding

**Solutions:**
1. Add `&tls=true` to connection string
2. Check MongoDB Atlas Network Access
3. Verify password URL encoding

### Error: "context deadline exceeded"

**Causes:**
1. Network access blocked
2. Firewall blocking connection
3. MongoDB cluster not accessible

**Solutions:**
1. Add `0.0.0.0/0` to MongoDB Atlas Network Access
2. Wait a few minutes for changes to propagate
3. Check MongoDB Atlas cluster status

---

## Quick Fix Checklist

- [ ] Updated `MONGO_URI` in Railway with `&tls=true`
- [ ] Saved Railway environment variable
- [ ] Verified MongoDB Atlas Network Access (0.0.0.0/0)
- [ ] Checked Railway logs for connection success
- [ ] Verified password is URL-encoded correctly

---

## Updated Railway Environment Variable

Copy this to Railway → Variables → MONGO_URI:

```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority&tls=true
```

---

**Last Updated:** 2024

