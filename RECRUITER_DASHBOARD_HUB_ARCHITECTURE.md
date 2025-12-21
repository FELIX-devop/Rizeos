# Recruiter Dashboard - Hub Architecture

## 🎯 Overview

The Recruiter Dashboard has been refactored to a **Hub-based architecture** where Overview serves as a navigation hub, and each feature has its own dedicated page with isolated API calls.

---

## 📐 Architecture Pattern

### **Before (Unified Page)**
```
/dashboard/recruiter
  └── All sections in one page
      ├── Post Job (with API)
      ├── Jobs List (with API)
      ├── Job Seekers (with API)
      └── Payments (with API)
```

**Problems:**
- ❌ All APIs called on Overview load
- ❌ Duplicate UI elements
- ❌ Heavy page with all logic

### **After (Hub Architecture)**
```
/dashboard/recruiter (Overview - HUB only)
  ├── Navigation cards (no API calls)
  └── Redirects to dedicated pages:
      ├── /dashboard/recruiter/post-job (PostJobPage)
      ├── /dashboard/recruiter/jobs (JobsPage)
      ├── /dashboard/recruiter/job-seekers (JobSeekersPage)
      ├── /dashboard/recruiter/payments (PaymentsPage)
      └── /dashboard/recruiter/profile (ProfilePage)
```

**Benefits:**
- ✅ Overview is lightweight (no API calls)
- ✅ Each page has single responsibility
- ✅ APIs called only when needed
- ✅ No duplication

---

## 🗂️ File Structure

```
frontend/src/pages/recruiter/
├── RecruiterDashboardLayout.jsx  ← Layout wrapper for nested routes
├── Overview.jsx                   ← Navigation hub (no API calls)
├── PostJobPage.jsx               ← Post job (createJob API)
├── JobsPage.jsx                   ← Jobs list (listJobs API)
├── JobSeekersPage.jsx             ← Seekers search (listUsers API)
├── PaymentsPage.jsx               ← Payments (listPayments API)
└── ProfilePage.jsx                ← Profile edit (getProfile, updateProfile APIs)
```

---

## 🛣️ Routing Structure

### **Nested Routes**

```jsx
<Route path="/dashboard/recruiter" element={<RecruiterDashboardLayout />}>
  <Route index element={<Overview />} />                    // /dashboard/recruiter
  <Route path="post-job" element={<PostJobPage />} />       // /dashboard/recruiter/post-job
  <Route path="jobs" element={<JobsPage />} />              // /dashboard/recruiter/jobs
  <Route path="job-seekers" element={<JobSeekersPage />} /> // /dashboard/recruiter/job-seekers
  <Route path="payments" element={<PaymentsPage />} />      // /dashboard/recruiter/payments
  <Route path="profile" element={<ProfilePage />} />        // /dashboard/recruiter/profile
</Route>
```

---

## 📄 Component Responsibilities

### **1. RecruiterDashboardLayout.jsx**

**Purpose:** Layout wrapper for all recruiter dashboard routes

**Responsibilities:**
- Provides consistent header
- Renders `<Outlet />` for nested routes
- No business logic

**Props:** None

---

### **2. Overview.jsx**

**Purpose:** Navigation hub - redirects to feature pages

**Responsibilities:**
- Display navigation cards
- Redirect to dedicated pages
- **NO API calls**
- **NO business logic**

**Features:**
- 4 navigation cards:
  - Post Job → `/dashboard/recruiter/post-job`
  - Jobs → `/dashboard/recruiter/jobs`
  - Job Seekers → `/dashboard/recruiter/job-seekers`
  - Payments → `/dashboard/recruiter/payments`

---

### **3. PostJobPage.jsx**

**Purpose:** Create new job postings

**Responsibilities:**
- Display job creation form
- Handle payment integration
- Call `createJob` API
- Redirect to jobs page after creation

**API Calls:**
- `createJob(token, payload)` - **ONLY HERE**

**Props:**
```javascript
{
  config: {
    admin_wallet: string,
    platform_fee_matic: number
  }
}
```

---

### **4. JobsPage.jsx**

**Purpose:** View and manage job postings

**Responsibilities:**
- Display list of jobs
- Refresh jobs list
- Navigate to post job page
- **NO job creation logic**

**API Calls:**
- `listJobs(token)` - **ONLY HERE**

**Props:** None

---

### **5. JobSeekersPage.jsx**

**Purpose:** Search and view job seekers

**Responsibilities:**
- Display seekers table
- Handle search/filter
- Show seeker profile modal
- **NO job creation logic**

**API Calls:**
- `listUsers(token, { role: 'seeker', ... })` - **ONLY HERE**

**Props:** None

---

### **6. PaymentsPage.jsx**

**Purpose:** View payment history and make payments

**Responsibilities:**
- Display payment history
- Handle new payments (PaymentButton)
- Show payment statistics
- **NO job creation logic**

**API Calls:**
- `listPayments(token)` - **ONLY HERE**

**Props:**
```javascript
{
  config: {
    admin_wallet: string,
    platform_fee_matic: number
  }
}
```

---

### **7. ProfilePage.jsx**

**Purpose:** Edit recruiter profile

**Responsibilities:**
- Display profile form
- Handle profile updates
- **NO other business logic**

**API Calls:**
- `getProfile(token)` - **ONLY HERE**
- `updateProfile(token, payload)` - **ONLY HERE**

**Props:** None

---

## 🔄 Data Flow

### **Overview Page (Hub)**

```
User visits /dashboard/recruiter
  ↓
Overview component renders
  ↓
Navigation cards displayed
  ↓
User clicks a card
  ↓
Navigate to dedicated page
  ↓
Dedicated page loads and calls its API
```

### **Post Job Flow**

```
User clicks "Post Job" card
  ↓
Navigate to /dashboard/recruiter/post-job
  ↓
PostJobPage loads
  ↓
User completes payment
  ↓
User fills form and submits
  ↓
createJob API called
  ↓
Success → Redirect to /dashboard/recruiter/jobs
```

### **Jobs List Flow**

```
User clicks "Jobs" card
  ↓
Navigate to /dashboard/recruiter/jobs
  ↓
JobsPage loads
  ↓
listJobs API called automatically
  ↓
Jobs list displayed
```

---

## ✅ Separation of Concerns

### **API Call Isolation**

| Feature | API | Location |
|---------|-----|----------|
| Post Job | `createJob()` | `PostJobPage.jsx` only |
| Jobs List | `listJobs()` | `JobsPage.jsx` only |
| Job Seekers | `listUsers()` | `JobSeekersPage.jsx` only |
| Payments | `listPayments()` | `PaymentsPage.jsx` only |
| Profile | `getProfile()`, `updateProfile()` | `ProfilePage.jsx` only |

### **No Duplication**

- ✅ **One API call per feature** - Each API is called from ONE place only
- ✅ **One UI per feature** - Each feature has ONE dedicated page
- ✅ **No shared state** - Each page manages its own state
- ✅ **No cross-page logic** - Pages are independent

---

## 🎨 UI/UX Flow

### **Navigation Pattern**

```
Overview (Hub)
  ↓
[Post Job Card] → PostJobPage
  ↓
[Jobs Card] → JobsPage
  ↓
[Job Seekers Card] → JobSeekersPage
  ↓
[Payments Card] → PaymentsPage
```

### **Back Navigation**

Each dedicated page has a "Back to Overview" button that navigates to `/dashboard/recruiter`.

---

## 🔍 Key Differences from Previous Architecture

### **Removed:**
- ❌ Tab navigation
- ❌ All sections in one page
- ❌ Multiple API calls on Overview
- ❌ Duplicate UI elements
- ❌ Shared state across sections

### **Added:**
- ✅ Hub-based navigation
- ✅ Dedicated pages per feature
- ✅ Isolated API calls
- ✅ Single responsibility per page
- ✅ Independent page state

---

## 📊 Component Dependency Graph

```
App.jsx
  └── RecruiterDashboardLayout
      ├── Overview (Hub)
      ├── PostJobPage
      ├── JobsPage
      ├── JobSeekersPage
      ├── PaymentsPage
      └── ProfilePage
```

**No dependencies between pages** - Each page is independent.

---

## 🚀 Benefits

### **1. Performance**
- Overview loads instantly (no API calls)
- Pages load data only when accessed
- Reduced initial load time

### **2. Maintainability**
- Single responsibility per page
- Easy to locate and fix issues
- Clear separation of concerns

### **3. Scalability**
- Easy to add new features
- No impact on existing pages
- Independent development

### **4. User Experience**
- Clear navigation structure
- Focused pages per task
- Better organization

---

## 🧪 Testing Checklist

### **Overview Page**
- [ ] Navigation cards display correctly
- [ ] Each card links to correct route
- [ ] No API calls on load
- [ ] Fast initial render

### **Post Job Page**
- [ ] Payment integration works
- [ ] Form validation works
- [ ] `createJob` API called on submit
- [ ] Redirects to jobs page after success

### **Jobs Page**
- [ ] `listJobs` API called on load
- [ ] Jobs list displays correctly
- [ ] Refresh button works
- [ ] "Post New Job" button navigates correctly

### **Job Seekers Page**
- [ ] `listUsers` API called on load
- [ ] Search functionality works
- [ ] Table displays correctly
- [ ] Profile modal opens on row click

### **Payments Page**
- [ ] `listPayments` API called on load
- [ ] Payment history displays correctly
- [ ] PaymentButton works
- [ ] Total calculation is correct

### **Profile Page**
- [ ] `getProfile` API called on load
- [ ] Form updates correctly
- [ ] `updateProfile` API called on save
- [ ] Success message displays

### **Navigation**
- [ ] All routes work correctly
- [ ] Back buttons navigate correctly
- [ ] NavBar profile link works
- [ ] No broken links

---

## 📝 Migration Notes

### **For Developers**

1. **No breaking changes** - All existing functionality preserved
2. **Same APIs** - Backend APIs unchanged
3. **New routes** - Use nested routing structure
4. **Independent pages** - Each page is self-contained

### **For Users**

1. **Familiar navigation** - Overview as starting point
2. **Dedicated pages** - Each feature has its own page
3. **Better organization** - Clear separation of features
4. **Faster loading** - Overview loads instantly

---

## 🎯 Summary

The Recruiter Dashboard now follows a **Hub Architecture** pattern:

- ✅ **Overview** = Navigation hub (no API calls)
- ✅ **Dedicated pages** = One feature per page
- ✅ **Isolated APIs** = Each API called from one place only
- ✅ **No duplication** = Single responsibility per page
- ✅ **Clean routing** = Nested routes with clear structure

**Result:** A scalable, maintainable, and performant dashboard architecture! 🎉

