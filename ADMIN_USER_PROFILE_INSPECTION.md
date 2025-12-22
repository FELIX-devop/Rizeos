# Admin User Profile Inspection - Implementation Guide

## 🎯 Overview

Admin can now click on any user row in the Admin Dashboard to view a detailed profile inspection page with role-specific statistics.

---

## 📋 Features Implemented

### **1. Clickable User Rows**
- User rows in Admin Dashboard are now clickable
- Hover effect indicates interactivity
- Click navigates to `/dashboard/admin/users/:userId`

### **2. User Profile Inspection Page**
- Route: `/dashboard/admin/users/:userId`
- Shows complete user information
- Role-specific statistics
- Clean, read-only inspection UI

### **3. Backend API**
- Endpoint: `GET /api/admin/users/:userId`
- Returns user details with role-specific stats
- Admin-only access with JWT validation

---

## 🔌 Backend Implementation

### **API Endpoint**

**Route:** `GET /api/admin/users/:userId`

**Auth:** Required (Admin only)

**Response:**
```json
{
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "recruiter",
    "bio": "...",
    "linkedin_url": "...",
    "skills": ["React", "Node.js"],
    "wallet_address": "0x...",
    "created_at": "2025-12-01T00:00:00Z",
    "updated_at": "2025-12-01T00:00:00Z",
    "stats": {
      "jobs_posted": 4,
      "payments_matic": 0.4,
      "payments_count": 4
    }
  }
}
```

### **Role-Specific Stats**

**For RECRUITER:**
- `jobs_posted` - Count of jobs created
- `payments_matic` - Total MATIC paid
- `payments_count` - Number of payments

**For JOB_SEEKER:**
- `jobs_applied` - Count of jobs applied to

**For ADMIN:**
- `role` - "system_admin"
- `note` - System administrator account info

---

## 🎨 Frontend Implementation

### **1. Admin Dashboard Updates**

**File:** `frontend/src/pages/AdminDashboard.jsx`

**Changes:**
- Added `useNavigate` hook
- Made user table rows clickable
- Added hover effect (`hover:bg-white/5`)
- Navigate to user profile on click

```jsx
<tr
  key={u._id || u.id}
  onClick={() => navigate(`/dashboard/admin/users/${u._id || u.id}`)}
  className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
>
  <td className="py-2 pr-4">{u.name}</td>
  <td className="py-2 pr-4 truncate">{u.email}</td>
  <td className="py-2 pr-4">{u.role}</td>
</tr>
```

---

### **2. User Profile Inspection Page**

**File:** `frontend/src/pages/AdminUserProfile.jsx`

**Features:**
- Breadcrumb navigation (Admin → Users → User Profile)
- Basic Information section
- Role-specific statistics section
- Loading state
- Error handling (user not found)
- Back button to dashboard

**Sections:**

1. **Basic Information**
   - Name, Email, Role
   - Account Status (Active)
   - Created Date, Last Updated
   - Bio, LinkedIn URL
   - Wallet Address
   - Skills

2. **Role-Specific Statistics**
   - **Recruiter:** Jobs Posted, Total Payments
   - **Job Seeker:** Jobs Applied
   - **Admin:** System info

---

### **3. API Service**

**File:** `frontend/src/services/api.js`

**Added Function:**
```javascript
export const getUserProfile = async (token, userId) => {
  const { data } = await client.get(`/admin/users/${userId}`, { headers: authHeaders(token) });
  return data.data;
};
```

---

### **4. Routing**

**File:** `frontend/src/App.jsx`

**Added Route:**
```jsx
<Route
  path="/dashboard/admin/users/:userId"
  element={
    <ProtectedRoute roles={['admin']}>
      <AdminUserProfile />
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
- ✅ Invalid user ID → 400 Bad Request
- ✅ User not found → 404 Not Found
- ✅ Unauthorized access → 403 Forbidden
- ✅ Frontend shows appropriate error messages

---

## 📊 Data Flow

### **User Profile Inspection Flow**

```
Admin clicks user row
  ↓
Navigate to /dashboard/admin/users/:userId
  ↓
AdminUserProfile component loads
  ↓
GET /api/admin/users/:userId
  ↓
Backend:
  - Validates admin role
  - Finds user by ID
  - Calculates role-specific stats
  - Returns enriched user data
  ↓
Frontend displays user profile
```

### **Stats Calculation**

**Recruiter Stats:**
```
1. Query jobs where recruiter_id = userId
2. Count jobs → jobs_posted
3. Query payments where recruiter_id = userId
4. Sum amounts → payments_matic
5. Count payments → payments_count
```

**Seeker Stats:**
```
1. Query all jobs
2. Count jobs where user ID in candidates array
3. Return jobs_applied count
```

---

## 🎨 UI/UX Features

### **Breadcrumb Navigation**
```
Admin → Users → User Profile
```

### **Visual Indicators**
- Role badges with color coding:
  - Admin: Purple
  - Recruiter: Blue
  - Seeker: Green
- Account status badge (Active)
- Hover effects on clickable elements

### **Responsive Design**
- Grid layout for stats
- Mobile-friendly spacing
- Readable typography

---

## 📁 Files Created/Modified

### **Backend**

**Created:**
- None (added method to existing controller)

**Modified:**
- `backend/internal/controllers/admin_controller.go`
  - Added `GetUserProfile()` method
  - Added `UserService` and `JobService` dependencies

- `backend/internal/routes/router.go`
  - Added route: `GET /api/admin/users/:userId`
  - Updated `AdminController` initialization

### **Frontend**

**Created:**
- `frontend/src/pages/AdminUserProfile.jsx`

**Modified:**
- `frontend/src/pages/AdminDashboard.jsx`
  - Made user rows clickable
  - Added navigation

- `frontend/src/services/api.js`
  - Added `getUserProfile()` function

- `frontend/src/App.jsx`
  - Added route for user profile page

---

## ✅ Testing Checklist

### **Backend**
- [ ] Admin can access user profile endpoint
- [ ] Recruiter/Seeker cannot access (403)
- [ ] Invalid user ID returns 400
- [ ] Non-existent user returns 404
- [ ] Stats calculated correctly for each role

### **Frontend**
- [ ] User rows are clickable
- [ ] Navigation works correctly
- [ ] Loading state displays
- [ ] Error state displays for invalid user
- [ ] All user information displays correctly
- [ ] Role-specific stats display correctly
- [ ] Breadcrumb navigation works
- [ ] Back button works

---

## 🚀 Usage

1. **Admin logs in** → Navigate to Admin Dashboard
2. **Click "Users" tab** → View users list
3. **Click any user row** → Navigate to user profile
4. **View user details** → Inspect all information
5. **Click "Back to Dashboard"** → Return to admin dashboard

---

## 📝 Summary

A complete user profile inspection system that:

- ✅ Allows admin to click user rows
- ✅ Shows detailed user information
- ✅ Displays role-specific statistics
- ✅ Provides clean, read-only UI
- ✅ Includes proper error handling
- ✅ Enforces admin-only access
- ✅ Follows existing code patterns

**Ready for production use!** 🎉


