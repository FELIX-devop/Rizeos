# MongoDB Atlas Connection String Setup

## Your MongoDB Atlas Connection String

**Original:**
```
mongodb+srv://rizeos_user:Qwertyuiop@123#@rizeos.ocor2vc.mongodb.net/?appName=RizeOS
```

## ⚠️ Important: URL Encoding Required

The password contains special characters (`#`) that must be URL-encoded for use in environment variables.

**URL-Encoded Password:**
- `Qwertyuiop@123#` → `Qwertyuiop%40123%23`
  - `@` becomes `%40`
  - `#` becomes `%23`

## ✅ Corrected Connection String for Railway

**For Railway Environment Variable (`MONGO_URI`):**

```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
```

**Changes made:**
1. ✅ Password URL-encoded: `Qwertyuiop@123#` → `Qwertyuiop%40123%23`
2. ✅ Database name added: `/rizeos` (before the `?`)
3. ✅ Connection options added: `?retryWrites=true&w=majority`
4. ✅ Removed `appName` parameter (not needed for Railway)

---

## How to Use in Railway

1. Go to your **Backend Service** in Railway
2. Navigate to **Variables** tab
3. Add/Update `MONGO_URI` with:
   ```
   mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
   ```
4. Save and redeploy

---

## Testing the Connection

### Test from Command Line

```bash
# Test connection (replace with your encoded password)
mongosh "mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority"
```

### Test from Railway Backend

After deploying, check the backend logs. You should see:
```
✅ Connected to MongoDB successfully
```

If you see connection errors, verify:
- [ ] Password is URL-encoded correctly
- [ ] Database name `/rizeos` is included
- [ ] Network access allows Railway IPs (or 0.0.0.0/0 for development)

---

## Security Notes

⚠️ **Important:**
- This connection string contains your password
- Never commit it to git
- Only store in Railway environment variables
- Consider rotating the password after initial setup
- For production, restrict MongoDB network access to Railway IPs only

---

## Quick Reference

**Environment Variable Name:** `MONGO_URI`

**Value:**
```
mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority
```

**Format:**
```
mongodb+srv://<username>:<url-encoded-password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

---

**Last Updated:** 2024

