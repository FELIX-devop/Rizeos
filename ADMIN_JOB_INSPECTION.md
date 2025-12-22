# Admin Job Inspection - Implementation Guide

## 🎯 Overview

Admin can now click on any job row in the Admin Dashboard to view a detailed job inspection page with recruiter information and activity statistics.

---

## 📋 Features Implemented

### **1. Clickable Job Rows**
- Job rows in Admin Dashboard are now clickable
- Hover effect indicates interactivity
- Click navigates to `/dashboard/admin/jobs/:jobId`

### **2. Job Inspection Page**
- Route: `/dashboard/admin/jobs/:jobId`
- Shows complete job information
- Recruiter details with link to profile
- Activity statistics
- Clean, read-only inspection UI

### **3. Backend API**
- Endpoint: `GET /api/admin/jobs/:jobId`
- Returns job details with recruiter info and stats
- Admin-only access with JWT validation

---

## 🔌 Backend Implementation

### **API Endpoint**

**Route:** `GET /api/admin/jobs/:jobId`

**Auth:** Required (Admin only)

**Response:**
```json
{
  "data": {
    "id": "...",
    "title": "Fullstack Developer",
    "description": "Spring Boot + React",
    "location": "Chennai",
    "budget": 60000,
    "status": "ACTIVE",
    "created_at": "2025-12-10T00:00:00Z",
    "updated_at": "2025-12-10T00:00:00Z",
    "skills": ["React", "Spring Boot"],
    "tags": ["Full-time", "Remote"],
    "recruiter": {
      "id": "...",
      "name": "felix antony",
      "email": "felixantony@gmail.com"
    },
    "stats": {
      "applications": 12,
      "payment_status": "PAID"
    }
  }
}
```

### **Data Enrichment**

**Recruiter Information:**
- Fetches recruiter user by `recruiter_id`
- Includes name and email
- Falls back to "Unknown" if recruiter not found

**Payment Status:**
- Checks if `payment_id` exists
- Verifies payment status is "verified"
- Returns "PAID" or "NOT_PAID"

**Applications Count:**
- Counts candidates in `job.Candidates` array
- Returns total number of applications

**Job Status:**
- Defaults to "ACTIVE"
- Can be extended for closed/archived jobs

---

## 🎨 Frontend Implementation

### **1. Admin Dashboard Updates**

**File:** `frontend/src/pages/AdminDashboard.jsx`

**Changes:**
- Made job table rows clickable
- Added hover effect (`hover:bg-white/5`)
- Navigate to job profile on click

```jsx
<tr
  key={j._id || j.id}
  onClick={() => navigate(`/dashboard/admin/jobs/${j._id || j.id}`)}
  className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
>
  <td className="py-2 pr-4">{j.title}</td>
  <td className="py-2 pr-4">{j.location || '—'}</td>
  <td className="py-2 pr-4">{j.budget || 0}</td>
</tr>
```

---

### **2. Job Inspection Page**

**File:** `frontend/src/pages/AdminJobProfile.jsx`

**Features:**
- Breadcrumb navigation (Admin → Jobs → Job Details)
- Job Information section
- Recruiter Information section
- Activity Summary section
- Loading and error states
- Back button to dashboard

**Sections:**

1. **Job Information**
   - Title, Status, Location, Budget
   - Created Date, Last Updated
   - Description
   - Required Skills
   - Tags

2. **Recruiter Information**
   - Recruiter Name
   - Recruiter Email
   - Link to recruiter profile

3. **Activity Summary**
   - Applications count
   - Payment status
   - Last updated date

---

### **3. API Service**

**File:** `frontend/src/services/api.js`

**Added Function:**
```javascript
export const getJobProfile = async (token, jobId) => {
  const { data } = await client.get(`/admin/jobs/${jobId}`, { headers: authHeaders(token) });
  return data.data;
};
```

---

### **4. Routing**

**File:** `frontend/src/App.jsx`

**Added Route:**
```jsx
<Route
  path="/dashboard/admin/jobs/:jobId"
  element={
    <ProtectedRoute roles={['admin']}>
      <AdminJobProfile />
    </ProtectedRoute>
  }
/>
```

---

## 🔐 Security

### **Access Control**
- ✅ Only `ADMIN` role can access
- ✅ JWT token validation required
- ✅ Route protected with `ProtectedRoute` component
- ✅ Backend validates admin role via middleware

### **Error Handling**
- ✅ Invalid job ID → 400 Bad Request
- ✅ Job not found → 404 Not Found
- ✅ Unauthorized access → 403 Forbidden
- ✅ Frontend shows appropriate error messages

---

## 📊 Data Flow

### **Job Inspection Flow**

```
Admin clicks job row
  ↓
Navigate to /dashboard/admin/jobs/:jobId
  ↓
AdminJobProfile component loads
  ↓
GET /api/admin/jobs/:jobId
  ↓
Backend:
  - Validates admin role
  - Finds job by ID
  - Fetches recruiter information
  - Checks payment status
  - Counts applications
  - Returns enriched job data
  ↓
Frontend displays job profile
```

### **Stats Calculation**

**Applications Count:**
```
Count items in job.Candidates array
```

**Payment Status:**
```
1. Check if job.PaymentID exists
2. Fetch payment by ID
3. Verify payment.status === "verified"
4. Return "PAID" or "NOT_PAID"
```

**Recruiter Info:**
```
1. Fetch user by job.RecruiterID
2. Extract name and email
3. Return recruiter object
```

---

## 🎨 UI/UX Features

### **Breadcrumb Navigation**
```
Admin → Jobs → Job Details
```

### **Visual Indicators**
- Status badges with color coding:
  - Active: Green
  - Closed: Red
- Payment status badges:
  - Paid: Green
  - Not Paid: Yellow
- Hover effects on clickable elements

### **Recruiter Profile Link**
- Clickable link to view recruiter profile
- Navigates to `/dashboard/admin/users/:userId`

### **Responsive Design**
- Grid layout for stats
- Mobile-friendly spacing
- Readable typography

---

## 📁 Files Created/Modified

### **Backend**

**Modified:**
- `backend/internal/controllers/admin_controller.go`
  - Added `GetJobProfile()` method

- `backend/internal/routes/router.go`
  - Added route: `GET /api/admin/jobs/:jobId`

### **Frontend**

**Created:**
- `frontend/src/pages/AdminJobProfile.jsx`

**Modified:**
- `frontend/src/pages/AdminDashboard.jsx`
  - Made job rows clickable
  - Added navigation

- `frontend/src/services/api.js`
  - Added `getJobProfile()` function

- `frontend/src/App.jsx`
  - Added route for job profile page

---

## ✅ Testing Checklist

### **Backend**
- [ ] Admin can access job profile endpoint
- [ ] Recruiter/Seeker cannot access (403)
- [ ] Invalid job ID returns 400
- [ ] Non-existent job returns 404
- [ ] Recruiter info fetched correctly
- [ ] Payment status calculated correctly
- [ ] Applications count calculated correctly

### **Frontend**
- [ ] Job rows are clickable
- [ ] Navigation works correctly
- [ ] Loading state displays
- [ ] Error state displays for invalid job
- [ ] All job information displays correctly
- [ ] Recruiter info displays correctly
- [ ] Activity stats display correctly
- [ ] Recruiter profile link works
- [ ] Breadcrumb navigation works
- [ ] Back button works

---

## 🚀 Usage

1. **Admin logs in** → Navigate to Admin Dashboard
2. **Click "Jobs" tab** → View jobs list
3. **Click any job row** → Navigate to job profile
4. **View job details** → Inspect all information
5. **Click recruiter link** → View recruiter profile (optional)
6. **Click "Back to Dashboard"** → Return to admin dashboard

---

## 📝 Summary

A complete job inspection system that:

- ✅ Allows admin to click job rows
- ✅ Shows detailed job information
- ✅ Displays recruiter details with profile link
- ✅ Shows activity statistics
- ✅ Provides clean, read-only UI
- ✅ Includes proper error handling
- ✅ Enforces admin-only access
- ✅ Follows existing code patterns

**Ready for production use!** 🎉


