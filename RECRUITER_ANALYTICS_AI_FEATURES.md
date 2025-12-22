# Recruiter Analytics & AI Features

## Overview

Two new features added to the Recruiter Dashboard:
1. **Analytics Dashboard** - Visual insights into market trends
2. **AI Auto Job Suggestion** - Intelligent job posting recommendations

---

## Feature 1: Analytics Dashboard

### UI Components

**Location**: `/dashboard/recruiter/analytics`

**Navigation**: 
- Added "Analytics" card to recruiter Overview page
- Card icon: 📊
- Route: `/dashboard/recruiter/analytics`

**Page Features**:
- Dropdown filter: "Analyze by" (Skills / Jobs)
- Chart.js visualizations
- Responsive charts with tooltips
- Dark theme compatible

### Charts

#### Skills Chart
- **Type**: Bar chart
- **Title**: "Most Available Skills Among Job Seekers"
- **Data**: Aggregated skill frequency across all job seekers
- **Shows**: Top 10 skills with candidate counts
- **Example**: React → 120 candidates, Java → 95 candidates

#### Jobs Chart
- **Type**: Bar chart
- **Title**: "Job Availability vs Candidate Supply"
- **Data**: Recruiter's posted jobs with matching candidate counts
- **Shows**: Number of candidates with fitment score ≥ 50% per job
- **Example**: Full Stack → 60 candidates, AI/ML → 25 candidates

### Backend APIs

#### GET `/api/recruiter/analytics/skills`
- Aggregates skills across all job seekers
- Returns: `[{ "skill": "React", "count": 120 }, ...]`
- Sorted by count (descending)
- Limited to top 20

#### GET `/api/recruiter/analytics/jobs`
- For recruiter's jobs only
- Uses AI fitment score model
- Counts candidates with score ≥ 50%
- Returns: `[{ "jobTitle": "Full Stack", "count": 60 }, ...]`
- Sorted by count (descending)

---

## Feature 2: AI Auto Job Suggestion

### UI Components

**Location**: Post Job page (`/dashboard/recruiter/post-job`)

**Trigger**:
- 💡 Light bulb icon button in top-right corner
- Label: "AI Suggestion"
- Opens modal/side panel

**Modal Features**:
- Shows 2-3 AI-generated job suggestions
- Each suggestion includes:
  - Job Title
  - Required Skills (as chips)
  - Job Description (short)
  - Reason for suggestion
- "Use This Template" button per suggestion
- Auto-fills form when template is used

### Backend API

#### GET `/api/recruiter/jobs/ai-suggestions`
- Analyzes skill frequency from job seekers
- Ranks top skill combinations
- Maps to common job roles
- Returns 2-3 suggested job templates

**Response Format**:
```json
{
  "suggestions": [
    {
      "title": "Full Stack Developer",
      "skills": ["React", "Node.js", "MongoDB"],
      "description": "We are looking for a Full Stack Developer...",
      "reason": "High availability of matching candidates"
    }
  ]
}
```

### AI Logic

1. **Skill Analysis**: Aggregates skills from all job seekers
2. **Frequency Ranking**: Identifies top skill combinations
3. **Job Title Inference**: Maps skills to job titles:
   - React + Node.js → "Full Stack Developer"
   - Python + ML → "AI/ML Engineer"
   - Java → "Java Developer"
   - Security skills → "Cyber Security Analyst"
4. **Description Generation**: Creates short job descriptions
5. **Reasoning**: Explains why suggestion is relevant

---

## Files Created/Modified

### Backend

**Created**:
- `backend/internal/controllers/recruiter_controller.go`
  - `GetSkillsAnalytics()` - Skills frequency aggregation
  - `GetJobsAnalytics()` - Job-candidate matching
  - `GetAISuggestions()` - AI job suggestions

**Modified**:
- `backend/internal/routes/router.go`
  - Added recruiter controller initialization
  - Added routes for analytics and AI suggestions

### Frontend

**Created**:
- `frontend/src/pages/recruiter/RecruiterAnalyticsPage.jsx`
  - Analytics dashboard with Chart.js
  - Skills and Jobs chart views
- `frontend/src/components/AIJobSuggestionModal.jsx`
  - AI suggestion modal component
  - Template application logic

**Modified**:
- `frontend/src/pages/recruiter/Overview.jsx`
  - Added Analytics card
- `frontend/src/pages/recruiter/PostJobPage.jsx`
  - Added AI suggestion button
  - Integrated AI suggestion modal
- `frontend/src/services/api.js`
  - Added `getSkillsAnalytics()`
  - Added `getJobsAnalytics()`
  - Added `getAISuggestions()`
- `frontend/src/App.jsx`
  - Added analytics route
  - Added import for RecruiterAnalyticsPage
- `frontend/package.json`
  - Added `chart.js` and `react-chartjs-2` dependencies

---

## Usage

### Analytics Dashboard

1. Navigate to Recruiter Dashboard
2. Click "Analytics" card
3. Select filter: "Skills" or "Jobs"
4. View charts with market insights

### AI Job Suggestions

1. Navigate to Post Job page
2. Click 💡 "AI Suggestion" button
3. Review AI-generated suggestions
4. Click "Use This Template" to auto-fill form
5. Edit and customize before posting

---

## Technical Details

### Chart.js Integration
- Registered components: Bar, Pie (for future use)
- Responsive design with `maintainAspectRatio: false`
- Dark theme colors for visibility
- Tooltips enabled

### AI Suggestion Algorithm
- Analyzes all job seeker skills
- Ranks by frequency
- Groups top skills into job templates
- Infers job titles from skill patterns
- Generates contextual descriptions

### Security
- All endpoints protected with `RecruiterOnly()` middleware
- JWT validation required
- Recruiter can only see their own job analytics

---

## Benefits

✅ **Data-Driven Decisions**: Visual insights into market trends  
✅ **Time Savings**: AI suggests optimal job postings  
✅ **Better Matches**: Understand candidate supply vs demand  
✅ **Professional UI**: Clean, modern analytics dashboard  
✅ **Intelligent Recommendations**: AI-powered job suggestions  

---

## Production Ready

✅ All features tested and integrated  
✅ Error handling implemented  
✅ Loading states added  
✅ Responsive design  
✅ Dark theme compatible  
✅ No breaking changes to existing features  

