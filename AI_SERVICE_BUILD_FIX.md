# AI Service Build Fix - Python Dependency Conflict

## 🔴 Problem

Build failing with error:
```
TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'
```

**Cause:** Version conflict between `pydantic==1.10.13` and newer `typing-extensions` package.

---

## ✅ Solution

I've updated `requirements.txt` to:
1. Allow newer compatible `pydantic` versions: `pydantic>=1.10.13,<2.0.0`
2. Explicitly require compatible `typing-extensions`: `typing-extensions>=4.5.0`
3. Added `runtime.txt` to specify Python 3.11

**Files Updated:**
- ✅ `ai-service/requirements.txt` - Fixed pydantic version constraint
- ✅ `ai-service/runtime.txt` - Added Python version specification

---

## 🔄 What Changed

### Before:
```txt
pydantic==1.10.13
```

### After:
```txt
pydantic>=1.10.13,<2.0.0
typing-extensions>=4.5.0
```

**Why:**
- `pydantic==1.10.13` is too strict and conflicts with newer dependencies
- Allowing `>=1.10.13,<2.0.0` lets pip resolve compatible versions
- Explicit `typing-extensions` ensures compatibility

---

## 🚀 Next Steps

1. **Railway will auto-redeploy** after the code is pushed
2. **Or manually trigger redeploy:**
   - Railway → AI Service → Deployments
   - Click "Redeploy" or wait for auto-deploy

3. **Monitor Build:**
   - Check Railway logs
   - Build should complete successfully now
   - First build still takes 5-10 minutes (downloads models)

---

## 📋 Build Process

The build will:
1. ✅ Install Python 3.11
2. ✅ Create virtual environment
3. ✅ Install dependencies (with fixed versions)
4. ✅ Download spaCy model
5. ✅ Start uvicorn server

---

## ✅ Expected Result

After fix, you should see:
```
✅ Successfully installed [all packages]
✅ Downloading en_core_web_sm...
✅ Build completed successfully
✅ Starting uvicorn...
```

---

## 🆘 If Build Still Fails

### Option 1: Pin Specific Versions

If you still get conflicts, try pinning exact versions:

```txt
pydantic==1.10.13
typing-extensions==4.8.0
```

### Option 2: Update All Packages

Update to latest compatible versions:

```txt
fastapi==0.115.0
pydantic==2.9.0
```

**But this might require code changes** (pydantic v2 has breaking changes).

---

## 📝 Current Configuration

**Python Version:** 3.11 (specified in `runtime.txt`)

**Key Dependencies:**
- `fastapi==0.110.3`
- `pydantic>=1.10.13,<2.0.0` (flexible version)
- `typing-extensions>=4.5.0` (explicit requirement)
- `spacy==3.7.4`
- `sentence-transformers==2.6.1`

---

## ✅ Verification

After successful build:

1. **Check Health:**
   ```bash
   curl https://your-ai-service.railway.app/
   ```
   Should return: `{"status":"ok"}`

2. **Check Docs:**
   ```bash
   # Open in browser
   https://your-ai-service.railway.app/docs
   ```

3. **Test Skill Extraction:**
   ```bash
   curl -X POST https://your-ai-service.railway.app/skills/extract \
     -H "Content-Type: application/json" \
     -d '{"text": "Skills: React, Node.js, MongoDB"}'
   ```

---

**The fix has been applied. Railway should auto-redeploy and the build should succeed!** 🚀

