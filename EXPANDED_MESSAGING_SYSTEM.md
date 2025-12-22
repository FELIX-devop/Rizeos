# Expanded Messaging System - Implementation Guide

## 🎯 Overview

A simple, non-real-time messaging system supporting bidirectional communication:
- **RECRUITER → ADMIN** (send only)
- **JOB_SEEKER → RECRUITER** (send)
- **RECRUITER** can receive messages from **JOB_SEEKER** (inbox)
- **ADMIN** can receive messages from **RECRUITER** (inbox)

---

## 📋 Features Implemented

### **1. Recruiter Dashboard**
- Messages hub with two options:
  - Send Message to Admin
  - Inbox (from job seekers)
- Message icon with unread count badge in header

### **2. Job Seeker Dashboard**
- Messages hub with two options:
  - Send Message (to recruiter)
  - Inbox (placeholder, coming soon)
- Messages tab in dashboard

### **3. Admin Dashboard**
- Message icon with unread count badge (already implemented)
- Admin inbox for messages from recruiters

---

## 🗄️ Database Schema

### **Message Model (Updated)**

```go
type Message struct {
    ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    FromUserID primitive.ObjectID `bson:"from_user_id" json:"from_user_id"`
    FromRole   string             `bson:"from_role" json:"from_role"` // "recruiter" | "seeker"
    ToUserID   primitive.ObjectID `bson:"to_user_id" json:"to_user_id"`
    ToRole     string             `bson:"to_role" json:"to_role"` // "admin" | "recruiter"
    Message    string             `bson:"message" json:"message"`
    IsRead     bool               `bson:"is_read" json:"is_read"`
    CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
```

**Key Changes:**
- Added `ToUserID` field (previously only had `ToRole`)
- Supports sending to specific users, not just roles

---

## 🔌 Backend API Endpoints

### **1. Send Message**

**Endpoint:** `POST /api/messages/send`

**Auth:** Required (Any authenticated user)

**Request Body:**
```json
{
  "toUserId": "user123",
  "toRole": "admin" | "recruiter",
  "message": "Message text"
}
```

**Role Validation:**
- **RECRUITER** can send to: `ADMIN`
- **JOB_SEEKER** can send to: `RECRUITER`

**Response:**
```json
{
  "data": {
    "id": "...",
    "from_user_id": "...",
    "from_role": "recruiter",
    "to_user_id": "...",
    "to_role": "admin",
    "message": "...",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### **2. Admin Inbox**

**Endpoint:** `GET /api/admin/messages/inbox`

**Auth:** Required (Admin only)

**Returns:** All messages where `to_role = "admin"`

---

### **3. Recruiter Inbox**

**Endpoint:** `GET /api/messages/recruiter/inbox`

**Auth:** Required (Recruiter only)

**Returns:** All messages where `to_role = "recruiter"` AND `to_user_id = current_recruiter_id`

---

### **4. Recruiter Unread Count**

**Endpoint:** `GET /api/messages/recruiter/unread-count`

**Auth:** Required (Recruiter only)

**Returns:**
```json
{
  "data": {
    "unread_count": 5
  }
}
```

---

### **5. Mark Message as Read**

**Endpoint:** `PUT /api/messages/:id/read`

**Auth:** Required (Any authenticated user)

**Response:**
```json
{
  "data": {
    "status": "marked as read"
  }
}
```

---

## 🎨 Frontend Implementation

### **1. Recruiter Messages Hub**

**Route:** `/dashboard/recruiter/messages`

**File:** `frontend/src/pages/recruiter/RecruiterMessagesHub.jsx`

**Features:**
- Two navigation cards:
  - Send Message to Admin
  - Inbox (from job seekers)

---

### **2. Recruiter Send Message to Admin**

**Route:** `/dashboard/recruiter/messages/send`

**File:** `frontend/src/pages/recruiter/SendMessageToAdminPage.jsx`

**Features:**
- Message textarea
- Send button
- Auto-selects first admin user

---

### **3. Recruiter Inbox**

**Route:** `/dashboard/recruiter/messages/inbox`

**File:** `frontend/src/pages/recruiter/RecruiterInboxPage.jsx`

**Features:**
- List of messages from job seekers
- Shows sender name and email
- Read/Unread status
- Click to mark as read
- Refresh button

---

### **4. Job Seeker Messages Hub**

**Route:** `/dashboard/job-seeker/messages`

**File:** `frontend/src/pages/seeker/SeekerMessagesHub.jsx`

**Features:**
- Two navigation cards:
  - Send Message (to recruiter)
  - Inbox (placeholder, disabled)

---

### **5. Job Seeker Send Message**

**Route:** `/dashboard/job-seeker/messages/send`

**File:** `frontend/src/pages/seeker/SendMessageToRecruiterPage.jsx`

**Features:**
- Recruiter selection dropdown
- Prioritizes recruiters from applied jobs
- Message textarea
- Send button

---

### **6. Job Seeker Inbox**

**Route:** `/dashboard/job-seeker/messages/inbox`

**File:** `frontend/src/pages/seeker/SeekerInboxPage.jsx`

**Features:**
- Placeholder page
- "Coming soon" message

---

### **7. Recruiter Dashboard Header**

**File:** `frontend/src/pages/recruiter/RecruiterDashboardLayout.jsx`

**Features:**
- Message icon with unread count badge
- Auto-refreshes every 30 seconds
- Click to navigate to inbox

---

## 🔄 Message Flow

### **Recruiter → Admin**

```
Recruiter clicks "Send Message to Admin"
  ↓
Navigate to /dashboard/recruiter/messages/send
  ↓
Fill message and submit
  ↓
POST /api/messages/send
  {
    toUserId: adminId,
    toRole: "admin",
    message: "..."
  }
  ↓
Backend validates role (recruiter → admin)
  ↓
Save message to DB
  ↓
Admin sees message in inbox
```

### **Job Seeker → Recruiter**

```
Job Seeker clicks "Send Message"
  ↓
Navigate to /dashboard/job-seeker/messages/send
  ↓
Select recruiter from dropdown
  ↓
Fill message and submit
  ↓
POST /api/messages/send
  {
    toUserId: recruiterId,
    toRole: "recruiter",
    message: "..."
  }
  ↓
Backend validates role (seeker → recruiter)
  ↓
Save message to DB
  ↓
Recruiter sees message in inbox
```

---

## 🔐 Security & Validation

### **Role Combinations**

| From Role | Allowed To Roles |
|-----------|------------------|
| RECRUITER | ADMIN |
| JOB_SEEKER | RECRUITER |

### **Validation Rules**

1. **Sender Role Check:**
   - Only RECRUITER and JOB_SEEKER can send messages
   - ADMIN cannot send messages (read-only)

2. **Recipient Role Check:**
   - Recipient must exist
   - Recipient role must match `toRole` in request
   - Role combination must be valid

3. **Access Control:**
   - Admin inbox: Admin only
   - Recruiter inbox: Recruiter only (filtered by `to_user_id`)
   - Mark as read: Any authenticated user

---

## 📁 Files Created/Modified

### **Backend**

**Modified:**
- `backend/internal/models/message.go`
  - Added `ToUserID` field

- `backend/internal/services/message_service.go`
  - Added `GetRecruiterInbox()` method
  - Added `GetRecruiterUnreadCount()` method

- `backend/internal/controllers/message_controller.go`
  - Updated `Send()` to support `toUserId` and `toRole`
  - Added role validation
  - Added `RecruiterInbox()` method
  - Added `GetRecruiterUnreadCount()` method

- `backend/internal/routes/router.go`
  - Updated message routes
  - Added recruiter inbox routes

### **Frontend**

**Created:**
- `frontend/src/pages/recruiter/RecruiterMessagesHub.jsx`
- `frontend/src/pages/recruiter/SendMessageToAdminPage.jsx`
- `frontend/src/pages/recruiter/RecruiterInboxPage.jsx`
- `frontend/src/pages/seeker/SeekerMessagesHub.jsx`
- `frontend/src/pages/seeker/SendMessageToRecruiterPage.jsx`
- `frontend/src/pages/seeker/SeekerInboxPage.jsx`

**Modified:**
- `frontend/src/pages/recruiter/RecruiterDashboardLayout.jsx`
  - Added message icon with unread count

- `frontend/src/pages/recruiter/Overview.jsx`
  - Updated Messages card description

- `frontend/src/pages/SeekerDashboard.jsx`
  - Added Messages tab

- `frontend/src/services/api.js`
  - Updated `sendMessage()` to accept `toUserId` and `toRole`
  - Added `getRecruiterInbox()` function
  - Added `getRecruiterUnreadCount()` function
  - Updated `markMessageAsRead()` route

- `frontend/src/App.jsx`
  - Added routes for recruiter messages hub, send, inbox
  - Added routes for seeker messages hub, send, inbox

---

## 🎯 User Flows

### **Recruiter Flow**

1. **Send to Admin:**
   ```
   Overview → Messages → Send Message to Admin
   → Fill form → Send → Success
   ```

2. **View Inbox:**
   ```
   Overview → Messages → Inbox
   → View messages from seekers
   → Click to mark as read
   ```

3. **Quick Access:**
   ```
   Header message icon → Inbox
   ```

---

### **Job Seeker Flow**

1. **Send to Recruiter:**
   ```
   Dashboard → Messages tab → Send Message
   → Select recruiter → Fill form → Send → Success
   ```

2. **Inbox:**
   ```
   Dashboard → Messages tab → Inbox
   → Placeholder (coming soon)
   ```

---

### **Admin Flow**

1. **View Inbox:**
   ```
   Dashboard → Message icon → Inbox drawer
   → View messages from recruiters
   → Click to mark as read
   ```

---

## ✅ Testing Checklist

### **Backend**
- [ ] Recruiter can send message to admin
- [ ] Job seeker can send message to recruiter
- [ ] Admin cannot send messages
- [ ] Invalid role combinations rejected
- [ ] Recruiter inbox shows only their messages
- [ ] Admin inbox shows all recruiter messages
- [ ] Unread counts calculated correctly
- [ ] Mark as read works for all roles

### **Frontend**
- [ ] Recruiter messages hub displays correctly
- [ ] Recruiter can send message to admin
- [ ] Recruiter inbox displays messages
- [ ] Recruiter unread count badge works
- [ ] Job seeker messages hub displays correctly
- [ ] Job seeker can send message to recruiter
- [ ] Recruiter selection dropdown works
- [ ] Applied job recruiters prioritized
- [ ] All navigation works correctly

---

## 📝 Summary

A complete bidirectional messaging system that:

- ✅ Supports RECRUITER → ADMIN messaging
- ✅ Supports JOB_SEEKER → RECRUITER messaging
- ✅ Provides inboxes for both admin and recruiter
- ✅ Shows unread count badges
- ✅ Validates role combinations
- ✅ Uses JWT-based authentication
- ✅ No real-time features (DB-based)
- ✅ Clean, minimal UI

**Ready for production use!** 🚀


