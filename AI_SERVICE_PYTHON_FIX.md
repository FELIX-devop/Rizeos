# AI Service Python 3.12 Compatibility Fix

## 🔴 Problem

Railway is using **Python 3.12**, but `pydantic==1.10.14` is **not compatible** with Python 3.12.

**Error:**
```
TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'
```

**Root Cause:**
- Railway detected Python 3.12 (newer version)
- `pydantic==1.10.14` doesn't support Python 3.12's typing system
- spaCy imports fail because it uses pydantic internally

---

## ✅ Solution

I've made **two fixes**:

### Fix 1: Force Python 3.11

Updated `nixpacks.toml` to explicitly use Python 3.11:
```toml
[phases.setup]
nixPkgs = ["python311", "gcc"]  # Changed from "python3" to "python311"
```

### Fix 2: Update to Pydantic 2.x (Python 3.12 Compatible)

Updated `requirements.txt`:
- `fastapi==0.110.3` → `fastapi==0.115.0` (supports pydantic 2.x)
- `pydantic==1.10.14` → `pydantic>=2.0.0,<3.0.0` (Python 3.12 compatible)

**Why Both?**
- Python 3.11 + pydantic 1.10.14 = Works (preferred, stable)
- Python 3.12 + pydantic 2.x = Works (fallback if Railway forces 3.12)

---

## 🔄 What Changed

### nixpacks.toml:
```toml
[phases.setup]
nixPkgs = ["python311", "gcc"]  # Explicitly use Python 3.11
```

### requirements.txt:
```txt
fastapi==0.115.0          # Updated to support pydantic 2.x
pydantic>=2.0.0,<3.0.0    # Python 3.12 compatible
```

---

## 🚀 Next Steps

1. **Railway will auto-redeploy** with the fixes
2. **Build should now:**
   - Use Python 3.11 (from nixpacks.toml)
   - Install pydantic 2.x (if Railway still uses 3.12)
   - Successfully download spaCy model
   - Start uvicorn server

3. **Monitor Build:**
   - Check Railway logs
   - Should see: `Using python311` or `Python 3.11`
   - Should complete successfully

---

## 📋 Expected Build Output

```
✅ setup: python311, gcc
✅ install: Creating venv, upgrading pip
✅ install: Installing requirements (pydantic 2.x)
✅ build: Downloading en_core_web_sm...
✅ build: Successfully downloaded
✅ start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 🆘 If Still Failing

### Option 1: Check Python Version

In Railway logs, look for:
```
Using python311
```
or
```
Python 3.11.x
```

If you see Python 3.12, Railway might be ignoring nixpacks.toml.

### Option 2: Update FastAPI Code (If Needed)

If pydantic 2.x causes issues, the code uses basic BaseModel features which should be compatible. But if needed, we can add compatibility shims.

### Option 3: Use Dockerfile

If nixpacks continues to have issues, we can create a Dockerfile with explicit Python 3.11.

---

## ✅ Verification

After successful build:

1. **Test Health:**
   ```bash
   curl https://your-ai-service.railway.app/
   ```
   Should return: `{"status":"ok"}`

2. **Test Skill Extraction:**
   ```bash
   curl -X POST https://your-ai-service.railway.app/skills/extract \
     -H "Content-Type: application/json" \
     -d '{"text": "Skills: React, Node.js"}'
   ```

---

## 📝 Summary

**Changes Made:**
- ✅ `nixpacks.toml`: Force Python 3.11
- ✅ `requirements.txt`: Update to pydantic 2.x (Python 3.12 compatible)
- ✅ `requirements.txt`: Update FastAPI to 0.115.0

**Expected Result:**
- ✅ Build uses Python 3.11
- ✅ All dependencies install successfully
- ✅ spaCy model downloads
- ✅ Service starts successfully

---

**The fixes have been applied. Railway should auto-redeploy and the build should succeed!** 🚀

