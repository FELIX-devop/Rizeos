# Internal Messaging System - Implementation Guide

## 🎯 Overview

A simple, non-real-time messaging system where **RECRUITER** can send messages to **ADMIN**, and **ADMIN** can view them in their dashboard.

---

## 📋 Architecture

### **Backend (Go)**
- **Model:** `Message` with MongoDB storage
- **Service:** `MessageService` for database operations
- **Controller:** `MessageController` for API endpoints
- **Routes:** Protected routes with role-based access

### **Frontend (React)**
- **Recruiter:** Messages page to send messages
- **Admin:** Message icon with unread count badge + drawer for viewing messages

---

## 🗄️ Database Schema

### **Message Model**

```go
type Message struct {
    ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    FromUserID primitive.ObjectID `bson:"from_user_id" json:"from_user_id"`
    FromRole   string             `bson:"from_role" json:"from_role"` // Always "recruiter"
    ToRole     string             `bson:"to_role" json:"to_role"`     // Always "admin"
    Message    string             `bson:"message" json:"message"`
    IsRead     bool               `bson:"is_read" json:"is_read"`
    CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
```

**MongoDB Collection:** `messages`

---

## 🔌 API Endpoints

### **1. Send Message (Recruiter → Admin)**

**Endpoint:** `POST /api/messages/send`

**Auth:** Required (Recruiter only)

**Request Body:**
```json
{
  "message": "Need approval for job posting"
}
```

**Response:**
```json
{
  "data": {
    "id": "...",
    "from_user_id": "...",
    "from_role": "recruiter",
    "to_role": "admin",
    "message": "Need approval for job posting",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Backend Logic:**
1. Extract `recruiterId` from JWT
2. Find ADMIN user
3. Save message to database
4. Return created message

---

### **2. Admin Inbox**

**Endpoint:** `GET /api/admin/messages/inbox`

**Auth:** Required (Admin only)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "from_user_id": "...",
      "from_user_name": "John Doe",
      "from_user_email": "john@example.com",
      "from_role": "recruiter",
      "to_role": "admin",
      "message": "Need approval for job posting",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Backend Logic:**
1. Query messages where `to_role = "admin"`
2. Sort by `created_at` descending (latest first)
3. Enrich with sender name and email
4. Return list

---

### **3. Mark Message as Read**

**Endpoint:** `PUT /api/admin/messages/:id/read`

**Auth:** Required (Admin only)

**Response:**
```json
{
  "data": {
    "status": "marked as read"
  }
}
```

**Backend Logic:**
1. Find message by ID
2. Update `is_read = true`
3. Return success

---

### **4. Get Unread Count**

**Endpoint:** `GET /api/admin/messages/unread-count`

**Auth:** Required (Admin only)

**Response:**
```json
{
  "data": {
    "unread_count": 5
  }
}
```

**Backend Logic:**
1. Count messages where `to_role = "admin"` AND `is_read = false`
2. Return count

---

## 🎨 Frontend Components

### **1. Recruiter Messages Page**

**Location:** `/dashboard/recruiter/messages`

**Features:**
- Textarea for message input
- Send button
- Success/error toast notifications
- Back to Overview button

**Component:** `frontend/src/pages/recruiter/MessagesPage.jsx`

---

### **2. Admin Messages Drawer**

**Location:** Admin Dashboard (drawer component)

**Features:**
- Slide-in drawer from right
- List of messages (latest first)
- Unread badge on new messages
- Click to mark as read
- Sender name and email
- Message timestamp

**Component:** `frontend/src/components/AdminMessagesDrawer.jsx`

---

### **3. Admin Dashboard Message Icon**

**Location:** Admin Dashboard header

**Features:**
- Message icon (📩)
- Unread count badge (red circle with number)
- Opens messages drawer on click
- Auto-refreshes unread count every 30 seconds

**Component:** Updated `frontend/src/pages/AdminDashboard.jsx`

---

## 🔄 Data Flow

### **Send Message Flow**

```
Recruiter fills message form
  ↓
Clicks "Send Message"
  ↓
POST /api/messages/send
  ↓
Backend extracts recruiterId from JWT
  ↓
Backend finds ADMIN user
  ↓
Backend saves message to DB
  ↓
Success response
  ↓
Frontend shows success toast
```

### **View Messages Flow**

```
Admin clicks message icon
  ↓
GET /api/admin/messages/inbox
  ↓
Backend queries messages (to_role = admin)
  ↓
Backend enriches with sender info
  ↓
Frontend displays messages in drawer
  ↓
Admin clicks message
  ↓
PUT /api/admin/messages/:id/read
  ↓
Backend marks message as read
  ↓
Frontend updates UI
```

### **Unread Count Flow**

```
Admin Dashboard loads
  ↓
GET /api/admin/messages/unread-count
  ↓
Backend counts unread messages
  ↓
Frontend displays badge
  ↓
Auto-refresh every 30 seconds
```

---

## 📁 File Structure

### **Backend Files**

```
backend/
├── internal/
│   ├── models/
│   │   └── message.go              ← Message model
│   ├── services/
│   │   └── message_service.go      ← Message service
│   ├── controllers/
│   │   └── message_controller.go    ← Message controller
│   └── routes/
│       └── router.go                ← Updated with message routes
```

### **Frontend Files**

```
frontend/src/
├── pages/
│   ├── recruiter/
│   │   └── MessagesPage.jsx         ← Recruiter send message page
│   └── AdminDashboard.jsx            ← Updated with message icon
├── components/
│   └── AdminMessagesDrawer.jsx      ← Admin inbox drawer
└── services/
    └── api.js                        ← Updated with message APIs
```

---

## 🔐 Security

### **Role-Based Access**

- **Send Message:** Only `RECRUITER` role
- **View Inbox:** Only `ADMIN` role
- **Mark as Read:** Only `ADMIN` role
- **Unread Count:** Only `ADMIN` role

### **JWT Validation**

All endpoints use `AuthMiddleware` to validate JWT tokens and extract user information.

---

## ✅ Features Implemented

### **Backend**
- ✅ Message model with MongoDB schema
- ✅ MessageService with CRUD operations
- ✅ MessageController with 4 endpoints
- ✅ Role-based route protection
- ✅ Message enrichment (sender name/email)

### **Frontend**
- ✅ Recruiter messages page
- ✅ Admin messages drawer
- ✅ Message icon with unread badge
- ✅ Auto-refresh unread count
- ✅ Mark as read functionality
- ✅ Navigation integration

---

## 🧪 Testing

### **Test Scenarios**

1. **Recruiter sends message**
   - Login as recruiter
   - Navigate to Messages page
   - Send a message
   - Verify success

2. **Admin views messages**
   - Login as admin
   - Click message icon
   - Verify messages appear
   - Verify unread badge

3. **Admin marks as read**
   - Click on unread message
   - Verify message marked as read
   - Verify badge count decreases

4. **Unread count refresh**
   - Send new message as recruiter
   - Wait for admin dashboard refresh
   - Verify badge updates

---

## 📝 API Usage Examples

### **Send Message (Recruiter)**

```javascript
import { sendMessage } from '../services/api.js';

const message = "Need approval for job posting";
await sendMessage(token, message);
```

### **Get Admin Inbox**

```javascript
import { getAdminInbox } from '../services/api.js';

const messages = await getAdminInbox(token);
```

### **Mark as Read**

```javascript
import { markMessageAsRead } from '../services/api.js';

await markMessageAsRead(token, messageId);
```

### **Get Unread Count**

```javascript
import { getUnreadCount } from '../services/api.js';

const { unread_count } = await getUnreadCount(token);
```

---

## 🎯 Summary

A simple, clean messaging system that:

- ✅ Allows recruiters to send messages to admin
- ✅ Shows unread count badge on admin dashboard
- ✅ Displays messages in a drawer
- ✅ Marks messages as read on click
- ✅ Uses role-based access control
- ✅ Stores messages in MongoDB
- ✅ No real-time features (simple DB-based)

**Ready for production use!** 🚀

