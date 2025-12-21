# RizeOS Local-Only Job & Networking Portal

Local end-to-end stack:
- Backend: Go + Gin + MongoDB + JWT + RBAC + Polygon payment verification
- AI microservice: FastAPI + spaCy skill extraction + Sentence-BERT matching
- Frontend: Vite + React + Tailwind + Framer Motion + ethers + MetaMask (Polygon Mumbai)

## 1) System Requirements
- Go 1.21+
- Python 3.10+
- Node.js 18+ / npm
- MongoDB running locally
- MetaMask installed (Polygon Mumbai testnet added)

## 2) Dependency Installation
```bash
# Backend deps
cd /Users/david/Desktop/Riseos/backend && go mod tidy

# AI service deps
cd /Users/david/Desktop/Riseos/ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Frontend deps
cd /Users/david/Desktop/Riseos/frontend && npm install
```

## 3) Backend Setup (Golang + Mongo + RBAC + Polygon verify)
Create `backend/.env` manually (workspace blocks editing `.env.example`). Use:
```
PORT=8080
MONGO_URI=mongodb://localhost:27017/rizeos
JWT_SECRET=super_secret_jwt_key
ADMIN_WALLET_ADDRESS=<YOUR_ADMIN_METAMASK_ADDRESS>
AI_SERVICE_URL=http://localhost:8000
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/<YOUR_RPC_KEY>
PLATFORM_FEE_MATIC=0.1
ADMIN_SIGNUP_CODE=owner-secret
```

Run backend:
```bash
cd /Users/david/Desktop/Riseos/backend
go run ./cmd/server
```

### Key endpoints (all under `/api`)
- `POST /auth/register` (roles: recruiter, seeker, admin with code)
- `POST /auth/login`
- `GET /auth/me` (JWT)
- `PUT /profile` (JWT)
- `POST /payments/verify` (recruiter + JWT) – verifies Polygon tx to admin wallet, stores hash
- `GET /payments` (recruiter/admin)
- `POST /jobs` (recruiter + JWT + verified payment_id)
- `GET /jobs` (public/optional auth for match scores)
- `GET /admin/dashboard` (admin only)
- `GET /config/public` (public admin wallet + fee)

## 4) AI Microservice (FastAPI)
Env (optional) `ai-service/.env`:
```
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
PORT=8000
```
Run:
```bash
cd /Users/david/Desktop/Riseos/ai-service
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Endpoints:
- `GET /health`
- `POST /skills/extract` {text,resume_base64}
- `POST /match` {job_description, candidate_bio}
- `POST /recommendations/recruiter|seeker`

## 5) Backend ↔ AI Integration
Backend calls AI via `AI_SERVICE_URL` for skill extraction and match scores. Ensure AI service is running before hitting profile or job listing for enriched data.

## 6) MetaMask + Polygon Payment Flow (Recruiter)
1. Open frontend → recruiter dashboard.
2. Click “Pay 0.1 MATIC” → MetaMask connects, enforces Mumbai (chainId 0x13881), sends to `ADMIN_WALLET_ADDRESS`.
3. After on-chain confirmation, frontend sends tx hash to `POST /payments/verify`.
4. Backend verifies recipient + amount via `POLYGON_RPC_URL`, stores tx hash, marks payment verified.
5. Recruiter creates job using returned `payment_id`. Job is linked to tx hash for admin reporting.

## 7) Frontend (Vite + Tailwind + Framer Motion)
Run:
```bash
cd /Users/david/Desktop/Riseos/frontend
npm run dev -- --host --port 5173
```
Pages:
- `/` vibrant feed + hero
- `/login`, `/register` (role-based)
- `/dashboard/recruiter` (MetaMask payment + job posting)
- `/dashboard/seeker` (AI match scores)
- `/dashboard/admin` (payments, totals)

## 8) Tests
Backend:
```bash
cd /Users/david/Desktop/Riseos/backend && go test ./...
```
AI service:
```bash
cd /Users/david/Desktop/Riseos/ai-service
source .venv/bin/activate
python -m pytest app/tests
```
Frontend (manual): run `npm run dev` then exercise role-based routes and MetaMask payment success/failure.

## 9) Admin Ownership
- Admin is the project owner. Set `ADMIN_WALLET_ADDRESS` to your MetaMask.
- Recruiters cannot change recipient; backend validates recipient equals admin wallet.
- Admin dashboard shows total payments, tx hashes, recruiter linkage.

## 10) Notes
- Use Mumbai testnet; fund accounts with test MATIC.
- Keep `ADMIN_SIGNUP_CODE` secret; only you can create admin account.
- If `.env.example` edits are blocked, use the env values above to create `.env` manually.

