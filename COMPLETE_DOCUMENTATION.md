# RizeOS Portal - Complete Documentation

> **Comprehensive guide covering all features, architecture, and implementation details**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Local Development Setup](#local-development-setup)
4. [Deployment Guide](#deployment-guide)
5. [Admin Features](#admin-features)
6. [Recruiter Features](#recruiter-features)
7. [Job Seeker Features](#job-seeker-features)
8. [Messaging System](#messaging-system)
9. [Payment System](#payment-system)
10. [AI & ML Features](#ai--ml-features)
11. [Job Fitment Scoring](#job-fitment-scoring)
12. [Skill Extraction](#skill-extraction)
13. [Routing & Navigation](#routing--navigation)
14. [UI/UX Improvements](#uiux-improvements)
15. [API Reference](#api-reference)
16. [Testing](#testing)

---

## Project Overview

**RizeOS Portal** is a modern job & hiring platform with AI-powered skill extraction, smart matching, and secure on-chain payments.

### Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, ethers.js
- **Backend:** Go 1.21, Gin Framework, MongoDB, JWT
- **AI Service:** Python 3.11, FastAPI, Sentence Transformers, spaCy
- **Blockchain:** Polygon Mumbai (MetaMask integration)
- **Database:** MongoDB

### Key Features

- ✅ Role-based dashboards (Admin, Recruiter, Job Seeker)
- ✅ AI-powered job fitment scoring
- ✅ Resume skill extraction
- ✅ On-chain payment verification (Polygon)
- ✅ Bidirectional messaging system
- ✅ Premium job seeker features
- ✅ Recruiter analytics dashboard
- ✅ AI job suggestions

---

## System Architecture

### Three-Service Architecture

```
┌─────────────────┐
│   Frontend      │  React + Vite (Port 5173)
│   (Port 5173)   │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │  Go + Gin (Port 8080)
│   (Port 8080)   │
└────────┬────────┘
         │
         ├──────────┐
         │          │
         │          │
┌────────▼────┐  ┌─▼──────────┐
│  MongoDB    │  │ AI Service │  Python + FastAPI (Port 8000)
│  (Port      │  │ (Port 8000)│
│  27017)     │  └────────────┘
└─────────────┘
```

### Service Responsibilities

**Frontend:**
- User interface and interactions
- MetaMask wallet integration
- API communication
- State management

**Backend:**
- Authentication & authorization (JWT)
- Business logic
- Database operations
- Payment verification
- API orchestration

**AI Service:**
- Resume skill extraction
- Job fitment score calculation
- Semantic similarity matching
- NLP processing

---

## Local Development Setup

### System Requirements

- Go 1.21+
- Python 3.10+
- Node.js 18+ / npm
- MongoDB (running locally or MongoDB Atlas)
- MetaMask installed (Polygon Mumbai testnet)

### Dependency Installation

```bash
# Backend dependencies
cd backend
go mod tidy

# AI service dependencies
cd ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Frontend dependencies
cd frontend
npm install
```

### Environment Configuration

#### Backend (.env)

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/rizeos
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_WALLET_ADDRESS=0x...
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_RPC_KEY
PLATFORM_FEE_MATIC=0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
ADMIN_SIGNUP_CODE=owner-secret
AI_SERVICE_URL=http://localhost:8000
```

#### AI Service (.env)

```env
PORT=8000
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080
VITE_AI_URL=http://localhost:8000
```

### Running Services

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7

# Terminal 2: AI Service
cd ai-service
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Backend
cd backend
go run ./cmd/server

# Terminal 4: Frontend
cd frontend
npm run dev
```

---

## Deployment Guide

### Docker Compose Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      MONGO_URI: mongodb://mongodb:27017/rizeos
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_WALLET_ADDRESS: ${ADMIN_WALLET_ADDRESS}
      AI_SERVICE_URL: http://ai-service:8000
      POLYGON_RPC_URL: ${POLYGON_RPC_URL}
      PLATFORM_FEE_MATIC: 0.1
      CORS_ALLOWED_ORIGINS: ${FRONTEND_URL}
    depends_on:
      - mongodb
      - ai-service

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      PORT: 8000
      MODEL_NAME: sentence-transformers/all-MiniLM-L6-v2
      SPACY_MODEL: en_core_web_sm

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

### Cloud Deployment Options

**Frontend:** Vercel, Netlify, Cloudflare Pages  
**Backend:** Railway, Render, Fly.io, AWS ECS  
**AI Service:** Railway, Render, Fly.io  
**Database:** MongoDB Atlas

---

## Admin Features

### Admin Dashboard

**Route:** `/dashboard/admin`

**Features:**
- View all users (clickable rows → user profile)
- View all jobs (clickable rows → job profile)
- View all transactions (card-based layout)
- Message inbox with unread count
- Announcement system

### User Profile Inspection

**Route:** `/dashboard/admin/users/:userId`

**Features:**
- Complete user information
- Role-specific statistics:
  - **Recruiter:** Jobs posted, payments made
  - **Job Seeker:** Jobs applied
  - **Admin:** System info
- Read-only inspection UI

### Job Profile Inspection

**Route:** `/dashboard/admin/jobs/:jobId`

**Features:**
- Complete job information
- Recruiter details with profile link
- Activity statistics:
  - Applications count
  - Payment status
  - Last updated

### Admin Announcements

**Feature:** Global announcements visible to all users
- Admin can send announcements
- Appears in Recruiter and Job Seeker inboxes
- Tagged as [ANNOUNCEMENT]

### Direct Messaging

**Feature:** Admin can send direct messages to any user
- From user profile inspection page
- 1-to-1 messaging (not global)
- Message appears in user's inbox

---

## Recruiter Features

### Recruiter Dashboard Hub

**Route:** `/dashboard/recruiter`

**Architecture:** Hub-based navigation system

**Overview Page:**
- Navigation cards (no API calls on load)
- Quick stats overview
- Links to dedicated pages

**Dedicated Pages:**
- `/dashboard/recruiter/post-job` - Post new jobs
- `/dashboard/recruiter/jobs` - View all jobs
- `/dashboard/recruiter/job-seekers` - Browse candidates
- `/dashboard/recruiter/payments` - Payment history
- `/dashboard/recruiter/profile` - Edit profile
- `/dashboard/recruiter/analytics` - Analytics dashboard
- `/dashboard/recruiter/jobs/:jobId/applicants` - View applicants

### Post Job Flow

1. **Payment Required:**
   - Click "Pay 0.1 MATIC" button
   - MetaMask popup opens
   - Transaction sent to admin wallet
   - Payment verified on-chain
   - Payment ID stored

2. **Create Job:**
   - Fill job form (title, description, skills, location, budget)
   - Submit with payment ID
   - Job created and visible to job seekers

### Job Applicants Management

**Route:** `/dashboard/recruiter/jobs/:jobId/applicants`

**Features:**
- View all applicants for a specific job
- Sort by applied date or fitment score
- View applicant profile (full details)
- Send message to applicant (job-context aware)
- Premium indicators (gold name, crown icon)

### Recruiter Analytics

**Route:** `/dashboard/recruiter/analytics`

**Features:**
- **Skills Chart:** Most available skills among job seekers
- **Jobs Chart:** Job availability vs candidate supply
- Dropdown filter: "Analyze by" (Skills / Jobs)
- Chart.js visualizations
- Data-driven insights

### AI Job Suggestions

**Location:** Post Job page (`/dashboard/recruiter/post-job`)

**Features:**
- 💡 Light bulb icon button
- AI-generated job suggestions based on:
  - Most common skills among job seekers
  - Market demand
  - Existing recruiter job history
- "Use This Template" button auto-fills form

### Recruiter Inbox

**Route:** `/dashboard/recruiter/messages/inbox`

**Features:**
- Messages from job seekers
- Unread count badge in header
- Auto-refresh every 30 seconds
- Mark as read functionality

---

## Job Seeker Features

### Job Seeker Dashboard

**Route:** `/dashboard/job-seeker`

**Features:**
- Browse available jobs
- AI fitment scores (premium feature)
- Apply to jobs
- View job details
- Premium upgrade CTA

### Job Application Flow

1. **Browse Jobs:**
   - View job list with match scores (if premium)
   - Click job card to view details

2. **Apply to Job:**
   - Click "Apply" button
   - Application stored in database
   - Duplicate prevention (can't apply twice)
   - Button changes to "Applied"

3. **View Job Details:**
   - Full job description
   - Required skills
   - Recruiter profile link
   - Send message to recruiter (job-context)

### Premium Features

**One-Time Payment:**
- Pay via MetaMask (Polygon)
- Unlock AI fitment scores for all jobs
- Premium badge (gold name, crown icon)
- Higher visibility to recruiters

**Premium Indicators:**
- Gold-colored name everywhere
- Crown icon next to name
- "Premium" badge on profile

### Job Seeker Inbox

**Route:** `/dashboard/job-seeker/inbox`

**Features:**
- Messages from Admin (announcements, direct messages)
- Messages from Recruiters
- Unread count badge in header
- Mark as read functionality

### Job Seeker Profile

**Route:** `/dashboard/job-seeker/profile`

**Sections:**
1. **Basic Information:** Name, Email, Phone
2. **Professional Summary:** Bio/Summary
3. **Education Details:** Degree, 10th Marks, 12th Marks
4. **Experience:** Years/Description
5. **Skills:** Extracted + Manual
6. **Profile Status:** Active/Inactive toggle
7. **Resume:** PDF upload

---

## Messaging System

### Architecture

**Database Schema:**
```go
type Message struct {
    ID         primitive.ObjectID
    FromUserID primitive.ObjectID
    FromRole   string  // "recruiter" | "seeker" | "admin"
    ToUserID   primitive.ObjectID
    ToRole     string  // "admin" | "recruiter" | "seeker"
    Message    string
    IsRead     bool
    JobID      *primitive.ObjectID  // Optional: job context
    CreatedAt  time.Time
}
```

### Message Flows

**1. Recruiter → Admin:**
- Recruiter sends message to admin
- Appears in admin inbox drawer
- Unread count badge

**2. Job Seeker → Recruiter:**
- Job seeker sends message (job-context aware)
- Appears in recruiter inbox
- Linked to specific job

**3. Admin → User (Direct):**
- Admin sends direct message from user profile
- 1-to-1 messaging (not global)
- Appears in user's inbox

**4. Admin → All (Announcements):**
- Admin sends global announcement
- Appears in all user inboxes
- Tagged as [ANNOUNCEMENT]

### API Endpoints

- `POST /api/messages/send` - Send message
- `GET /api/admin/messages/inbox` - Admin inbox
- `GET /api/messages/recruiter/inbox` - Recruiter inbox
- `GET /api/messages/seeker/inbox` - Job seeker inbox
- `PUT /api/messages/:id/read` - Mark as read
- `GET /api/admin/messages/unread-count` - Unread count
- `GET /api/messages/recruiter/unread-count` - Recruiter unread count
- `GET /api/messages/seeker/unread-count` - Seeker unread count

---

## Payment System

### Payment Flow

**1. Recruiter Payment (Per Job):**
```
Recruiter clicks "Pay 0.1 MATIC"
  ↓
MetaMask popup opens
  ↓
User confirms transaction
  ↓
Processing animation
  ↓
Transaction confirmed on-chain
  ↓
Backend verifies transaction
  ↓
Success animation
  ↓
Payment ID returned
  ↓
Job created with payment ID
```

**2. Job Seeker Premium Payment (One-Time):**
```
Job Seeker clicks "Try Premium"
  ↓
MetaMask payment
  ↓
Backend verifies
  ↓
isPremium = true
  ↓
Fitment scores unlocked
```

### Payment Animation

**States:**
- `idle` - No animation
- `processing` - Rotating loader, animated dots
- `success` - Green checkmark, auto-closes after 1.5s
- `failed` - Red X, manual close

**Features:**
- UPI-style payment experience
- Non-intrusive (doesn't block MetaMask)
- Clear visual feedback
- Error handling

### Payment Verification

**Backend Logic:**
1. Verify transaction hash on Polygon
2. Check recipient = admin wallet
3. Check amount ≥ platform fee
4. Mark payment as verified
5. Store payment record

---

## AI & ML Features

### AI Service Endpoints

**Base URL:** `http://localhost:8000`

**Endpoints:**
- `GET /` - Health check
- `POST /skills/extract` - Extract skills from resume
- `POST /match` - Calculate job fitment score
- `POST /recommendations/recruiter` - Recruiter suggestions
- `POST /recommendations/seeker` - Job seeker suggestions

### Skill Extraction

**Input:**
- Resume text (PDF → text)
- Bio text

**Output:**
- Normalized skill list
- Filtered (no institutions, degrees, locations)
- Section-aware extraction

**Process:**
1. Extract text from PDF
2. Identify skills section
3. Apply skill dictionary filter
4. Apply negative keyword filter
5. Normalize variants (js → JavaScript)
6. Return unique skills

### Job Fitment Scoring

**Model:** Hybrid scoring (70% semantic + 30% skill coverage)

**Semantic Similarity:**
- Model: `sentence-transformers/all-MiniLM-L6-v2`
- Cosine similarity between job description and candidate bio
- Normalized to 0-1 range

**Skill Coverage:**
- Required skill coverage (not Jaccard)
- Formula: `matched_required / total_required`
- Extra skills never penalize
- Optional bonus for extra skills (capped at 0.05)

**Final Score:**
```
semantic_score = cosine_similarity(job_text, candidate_text)
skill_score = required_skill_coverage(job_skills, candidate_skills)
final_score = 0.7 × semantic_score + 0.3 × skill_score
final_percentage = round(final_score × 100, 2)
```

**Color Coding:**
- 🟢 Green (≥75%): Strong Match
- 🟡 Yellow (50-74%): Moderate Match
- 🔴 Red (<50%): Weak Match

---

## Job Fitment Scoring

### Model Evolution

**Initial Model (Jaccard):**
- Used Jaccard similarity for skills
- Problem: Penalized candidates with extra skills
- Example: 6/6 required + 20 extra = lower score ❌

**Current Model (Required Skill Coverage):**
- Based on required skill coverage
- Extra skills never penalize
- Example: 6/6 required + 20 extra = 100% ✅

### Skill Score Calculation

```python
def _required_skill_coverage(required_skills, candidate_skills):
    # Normalize skills
    req_normalized = normalize_skills(required_skills)
    cand_normalized = normalize_skills(candidate_skills)
    
    # Calculate coverage
    matched = len(req_normalized & cand_normalized)
    total = len(req_normalized)
    skill_score = matched / total if total > 0 else 0.0
    
    # Optional bonus for extra skills
    extra_skills = cand_normalized - req_normalized
    if extra_skills and skill_score > 0:
        bonus = min(len(extra_skills) * 0.02, 0.05)
        skill_score = min(skill_score + bonus, 1.0)
    
    return skill_score
```

### Score Validation

**Test Scenarios:**
1. Perfect Match (6/6 skills) → Expected: 85-95%
2. Partial Match (5/6 skills) → Expected: 70-85%
3. High Semantic, Low Skills → Expected: 50-65%
4. High Skills, Low Semantic → Expected: 45-60%
5. No Match → Expected: <25%

---

## Skill Extraction

### Multi-Stage Pipeline

**Stage 1: Skill Vocabulary Filter**
- Maintain predefined skill dictionary
- Only allow matches from dictionary
- Case-insensitive matching

**Stage 2: Negative Keyword Filter**
- Remove education keywords (school, college, university)
- Remove location keywords (city names, states)
- Remove degree names (B.E, M.Tech, etc.)

**Stage 3: Section-Aware Extraction**
- Only extract from skills sections
- Ignore education, projects, certifications sections

**Stage 4: Skill Normalization**
- Normalize variants (js → JavaScript, nodejs → Node.js)
- Deduplicate after normalization

**Stage 5: Core Skills Allowlist**
- Always include core skills (HTML, CSS, JS, C, C++, SQL)
- Even if length ≤ 2

### Skill Dictionary

**Core Skills:**
- HTML, CSS, JavaScript, JS
- C, C++, C#
- Python, Java, SQL
- React, Angular, Vue
- Node.js, Spring Boot
- MongoDB, MySQL, PostgreSQL
- Docker, Kubernetes, AWS
- Machine Learning, Data Science

**Normalization Map:**
- "js" → "JavaScript"
- "nodejs" → "Node.js"
- "html5" → "HTML"
- "css3" → "CSS"
- "c plus plus" → "C++"

---

## Routing & Navigation

### Route Structure

**Public Routes:**
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

**Role-Based Routes:**
- `/dashboard/admin` - Admin dashboard
- `/dashboard/recruiter` - Recruiter dashboard
- `/dashboard/job-seeker` - Job seeker dashboard

**Nested Routes:**
- `/dashboard/recruiter/post-job` - Post job
- `/dashboard/recruiter/jobs` - Jobs list
- `/dashboard/recruiter/jobs/:jobId/applicants` - Applicants
- `/dashboard/recruiter/job-seekers` - Browse seekers
- `/dashboard/recruiter/payments` - Payments
- `/dashboard/recruiter/analytics` - Analytics
- `/dashboard/recruiter/profile` - Profile
- `/dashboard/admin/users/:userId` - User profile
- `/dashboard/admin/jobs/:jobId` - Job profile

### Route Utilities

**File:** `frontend/src/utils/routes.js`

```javascript
export const getDashboardRoute = (role) => {
  const routes = {
    admin: '/dashboard/admin',
    recruiter: '/dashboard/recruiter',
    seeker: '/dashboard/job-seeker',
  };
  return routes[role] || '/dashboard/recruiter';
};
```

### Protected Routes

**Component:** `ProtectedRoute`

**Features:**
- JWT authentication check
- Role-based access control
- Automatic redirects
- Wrong role → redirect to user's dashboard

---

## UI/UX Improvements

### Modern Login Page

**Features:**
- Glassmorphism design
- Input icons (Mail, Lock)
- Show/Hide password toggle
- Gradient buttons
- Right-side visual panel (desktop)
- Responsive design

### Modern Register Page

**Features:**
- Card-based role selection
- Password confirmation
- Admin code input (expandable)
- Feature descriptions
- Right-side visual panel

### Premium Landing Page

**Features:**
- Hero section with feature chips
- Trust/value strip
- Live job feed
- Premium value section
- Minimal footer
- Clickable feature descriptions (popups)

### Score Color Coding

**Utility:** `frontend/src/utils/scoreColor.js`

**Color Rules:**
- 🟢 Green (≥75%): Strong Match
- 🟡 Yellow (50-74%): Moderate Match
- 🔴 Red (<50%): Weak Match

**Applied To:**
- Job Seeker dashboard
- Recruiter applicant lists
- Admin views
- Job detail pages

### Transaction Cards

**Admin Dashboard:**
- Card-based layout (replaces simple list)
- Shortened transaction hash
- Copy-to-clipboard functionality
- Status badges (Success/Pending)
- Date/time display
- Hover effects

---

## API Reference

### Authentication

**POST /api/auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seeker" | "recruiter" | "admin",
  "admin_signup_code": "..." // Required for admin
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**GET /api/auth/me**
- Headers: `Authorization: Bearer <token>`
- Returns: Current user info

### Jobs

**GET /api/jobs**
- Query params: `skill`, `location`, `tag`
- Returns: Job list with match scores (if premium)

**POST /api/jobs**
- Headers: `Authorization: Bearer <token>`
- Body: `{ title, description, skills, location, budget, payment_id }`
- Role: Recruiter only

**GET /api/jobs/:jobId**
- Returns: Job details

### Job Applications

**POST /api/job-applications/apply**
- Headers: `Authorization: Bearer <token>`
- Body: `{ jobId }`
- Role: Job Seeker only
- Prevents duplicate applications

**GET /api/recruiter/jobs/:jobId/applicants**
- Headers: `Authorization: Bearer <token>`
- Query params: `sortBy` (applied_at | fitment_score)
- Role: Recruiter only (must own job)
- Returns: Applicant list with enriched data

### Payments

**POST /api/payments/verify**
- Headers: `Authorization: Bearer <token>`
- Body: `{ tx_hash }`
- Role: Recruiter only
- Verifies Polygon transaction

**POST /api/payments/verify-jobseeker-premium**
- Headers: `Authorization: Bearer <token>`
- Body: `{ tx_hash }`
- Role: Job Seeker only
- One-time premium payment

**GET /api/payments**
- Headers: `Authorization: Bearer <token>`
- Role: Recruiter/Admin
- Returns: Payment history

### Messages

**POST /api/messages/send**
- Headers: `Authorization: Bearer <token>`
- Body: `{ toUserId, toRole, message, jobId? }`
- Role: Recruiter, Job Seeker, Admin

**GET /api/admin/messages/inbox**
- Headers: `Authorization: Bearer <token>`
- Role: Admin only

**GET /api/messages/recruiter/inbox**
- Headers: `Authorization: Bearer <token>`
- Role: Recruiter only

**GET /api/messages/seeker/inbox**
- Headers: `Authorization: Bearer <token>`
- Role: Job Seeker only

### Analytics

**GET /api/recruiter/analytics/skills**
- Headers: `Authorization: Bearer <token>`
- Role: Recruiter only
- Returns: Skill frequency data

**GET /api/recruiter/analytics/jobs**
- Headers: `Authorization: Bearer <token>`
- Role: Recruiter only
- Returns: Job vs candidate supply data

**GET /api/recruiter/jobs/ai-suggestions**
- Headers: `Authorization: Bearer <token>`
- Role: Recruiter only
- Returns: AI-generated job suggestions

### Admin

**GET /api/admin/dashboard**
- Headers: `Authorization: Bearer <token>`
- Role: Admin only
- Returns: Dashboard stats

**GET /api/admin/users/:userId**
- Headers: `Authorization: Bearer <token>`
- Role: Admin only
- Returns: User profile with stats

**GET /api/admin/jobs/:jobId**
- Headers: `Authorization: Bearer <token>`
- Role: Admin only
- Returns: Job profile with recruiter info

**POST /api/admin/announcements**
- Headers: `Authorization: Bearer <token>`
- Body: `{ message }`
- Role: Admin only
- Creates global announcement

---

## Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### AI Service Tests

```bash
cd ai-service
source .venv/bin/activate
python -m pytest app/tests
```

### Manual Testing

**Job Fitment Score:**
```bash
curl -X POST http://localhost:8000/match \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Looking for a React developer",
    "candidate_bio": "Frontend developer with React experience",
    "job_skills": ["React", "JavaScript"],
    "candidate_skills": ["React", "JavaScript"]
  }'
```

**Skill Extraction:**
```bash
curl -X POST http://localhost:8000/skills/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Skills: React, Node.js, MongoDB"
  }'
```

---

## Security

### Authentication

- JWT-based authentication
- Token stored in localStorage
- Token expiration validation
- Role-based access control

### Authorization

**Middleware:**
- `AuthMiddleware` - Validates JWT
- `AdminOnly()` - Admin role required
- `RecruiterOnly()` - Recruiter role required
- `SeekerOnly()` - Job Seeker role required

### Payment Security

- On-chain transaction verification
- Recipient validation (must be admin wallet)
- Amount validation (≥ platform fee)
- Transaction hash verification

---

## Performance Optimizations

### Frontend

- Code splitting with React Router
- Lazy loading of components
- Optimized re-renders
- Efficient state management

### Backend

- Database indexing
- Connection pooling
- Efficient queries
- Caching where appropriate

### AI Service

- Lazy model loading
- Efficient embeddings
- Skill dictionary caching
- Normalized skill matching

---

## Future Enhancements

### Planned Features

1. **Real-time Notifications**
   - WebSocket integration
   - Push notifications
   - Email notifications

2. **Advanced Analytics**
   - Time-series charts
   - Predictive insights
   - Export reports

3. **Enhanced Matching**
   - Multi-factor scoring
   - Learning from feedback
   - Personalized recommendations

4. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

---

## Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure AI service CORS middleware is configured
- Check `CORS_ALLOWED_ORIGINS` in backend
- Restart services after CORS changes

**MongoDB Connection:**
- Verify MongoDB is running
- Check `MONGO_URI` in backend .env
- Test connection: `mongosh mongodb://localhost:27017`

**AI Service Not Loading:**
- Check Python dependencies installed
- Verify spaCy model downloaded: `python -m spacy download en_core_web_sm`
- Check port 8000 is available

**Payment Verification Fails:**
- Verify Polygon RPC URL is correct
- Check admin wallet address
- Ensure transaction is on Polygon Mumbai testnet

---

## Contributing

### Code Style

**Frontend:**
- Use functional components
- Follow React hooks best practices
- Use TailwindCSS for styling
- Follow existing component patterns

**Backend:**
- Follow Go conventions
- Use camelCase for JSON fields
- Add proper error handling
- Include JSDoc comments

**AI Service:**
- Follow PEP 8 style guide
- Add type hints
- Include docstrings
- Handle edge cases

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Test individual services
4. Verify environment variables

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** Production Ready

