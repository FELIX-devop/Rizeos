# Railway Build Fix - Root Directory Issue

## 🔴 Problem

Railway is trying to run `cd backend` but the `backend` directory doesn't exist in the build context because Railway is building from the root directory.

**Error:**
```
/bin/bash: line 1: cd: backend: No such file or directory
```

## ✅ Solution

You have **TWO options** to fix this:

---

## Option 1: Set Root Directory in Railway (RECOMMENDED)

This is the **easiest and recommended** solution:

### Steps:

1. **In Railway Dashboard:**
   - Go to your **Backend Service**
   - Click **Settings** tab
   - Find **"Root Directory"** field
   - Set to: `backend`
   - **Save**

2. **Update Build Command:**
   - In the same Settings page
   - Find **"Build Command"** field
   - Set to: `go build -o server ./cmd/server`
   - (Remove `cd backend &&` since you're already in the backend directory)

3. **Update Start Command:**
   - Find **"Start Command"** field
   - Set to: `./server`

4. **Save and Redeploy:**
   - Railway will automatically redeploy
   - The build should now work!

---

## Option 2: Use nixpacks.toml (Alternative)

If Option 1 doesn't work, we've created a `nixpacks.toml` file in the `backend/` directory that Railway will automatically detect.

### What We Did:

Created `backend/nixpacks.toml` with:
```toml
[phases.setup]
nixPkgs = ["go_1_21"]

[phases.install]
cmds = ["go mod download"]

[phases.build]
cmds = ["go build -o server ./cmd/server"]

[start]
cmd = "./server"
```

### Steps:

1. **Set Root Directory:**
   - Go to Railway → Backend Service → Settings
   - Set **Root Directory** to: `backend`
   - Save

2. **Remove Build Command:**
   - In Settings, **clear** the Build Command field
   - Railway will automatically use `nixpacks.toml`

3. **Save and Redeploy**

---

## 🎯 Quick Fix Checklist

- [ ] Go to Railway → Backend Service → Settings
- [ ] Set **Root Directory** to: `backend`
- [ ] Set **Build Command** to: `go build -o server ./cmd/server` (without `cd backend &&`)
- [ ] Set **Start Command** to: `./server`
- [ ] Save
- [ ] Wait for redeploy
- [ ] Check logs to verify build success

---

## 📝 Why This Happens

Railway builds from the **root directory** of your repository by default. When you set the **Root Directory** to `backend`, Railway changes its working directory to `backend/` before running build commands.

**Before (Wrong):**
```
Root Directory: (empty or root)
Build Command: cd backend && go build ...
→ Tries to cd into backend from root, but backend doesn't exist in build context
```

**After (Correct):**
```
Root Directory: backend
Build Command: go build -o server ./cmd/server
→ Already in backend/ directory, so just run go build
```

---

## 🔍 Verify It's Working

After fixing, check the Railway logs. You should see:

```
✅ Using Nixpacks
✅ setup: go_1_21
✅ install: go mod download
✅ build: go build -o server ./cmd/server
✅ start: ./server
```

---

## 🆘 Still Not Working?

1. **Check Root Directory:**
   - Make sure it's exactly `backend` (lowercase, no trailing slash)

2. **Check Build Command:**
   - Should be: `go build -o server ./cmd/server`
   - Should NOT include `cd backend &&`

3. **Check Service:**
   - Make sure you're editing the correct service
   - Backend service should have Root Directory = `backend`

4. **Redeploy:**
   - After making changes, Railway should auto-redeploy
   - Or manually trigger a new deployment

---

**Last Updated:** 2024

