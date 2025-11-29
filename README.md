---

# 📝 WorkRadius AI Collaborative Editor

### Real-time Collaborative Text Editor with AI Assistant (Google Gemini)

This project is a **Google Docs–style collaborative editor** built as part of the **Software Development Engineer – Intern** assignment for **WorkRadius AI Technologies Pvt Ltd**.

It includes:

✅ Real-time document collaboration
✅ Live cursor positions
✅ Secure JWT authentication
✅ Role-based document sharing
✅ AI writing assistant with Google Gemini
✅ Auto-save + Manual save
✅ Vercel frontend + Render backend deployment
---------------------------------------------

---

# 🚀 Tech Stack

### **Frontend**

* React.js
* React Quill (Rich Text Editor)
* Quill-Cursors (Live cursors)
* Axios
* Bootstrap UI

### **Backend**

* Node.js + Express.js
* MongoDB + Mongoose
* JWT Authentication
* Socket.IO for realtime sync
* Google Gemini API
* Express Rate Limiting
* CORS Security Setup

### **Deployment**

* Frontend → Vercel
* Backend → Render
* MongoDB → Atlas

---

---

# 📌 Core Features

## 1️⃣ Authentication & Authorization

* Register / Login
* JWT token stored in browser
* `/auth/me` to auto-login users on refresh
* Role-based authorization:

  * **Owner**
  * **Editor**
  * **Viewer**

---

## 2️⃣ Document Management

* Create new documents
* View list of documents
* Auto-save every 30 seconds
* Manual save option
* Share documents by email with role:

  * `editor`
  * `viewer`

---

## 3️⃣ Real-time Collaboration

✔ Multi-user editing
✔ Live cursor tracking
✔ Remote text updates using Quill Delta
✔ Online/offline indicators
✔ Broadcast “document saved” event

---

## 4️⃣ AI Writing Assistant (Google Gemini)

Provides 5 AI features:

| Feature           | Endpoint                |
| ----------------- | ----------------------- |
| Grammar check     | `/api/ai/grammar-check` |
| Text enhancement  | `/api/ai/enhance`       |
| Summaries         | `/api/ai/summarize`     |
| Auto-complete     | `/api/ai/complete`      |
| Smart suggestions | `/api/ai/suggestions`   |

Debounced **live suggestions** appear as user types.

---

## 5️⃣ Security

* JWT-based route protection
* Rate limiting (`100 requests / 15 mins`)
* XSS-safe Quill delta format
* CORS strict allowlist
* Socket.io authentication with JWT

---

---

# 📂 Project Structure

### **Backend** (`server/`)

```
server/
├── config/db.js
├── middleware/auth.js
├── middleware/rateLimiter.js
├── models/User.js
├── models/Document.js
├── routes/authRoutes.js
├── routes/documentRoutes.js
├── routes/aiRoutes.js
├── services/geminiService.js
├── websockets/documentHandler.js
└── server.js
```

### **Frontend** (`client/`)

```
client/src/
├── api/
│   ├── api.js
│   ├── auth.js
│   └── document.js
├── components/
│   ├── Navbar.js
│   └── AIAssistant.js
├── hooks/useAuth.js
├── pages/
│   ├── Auth.js
│   ├── DocumentList.js
│   └── EditorPage.js
├── services/socketService.js
└── App.js
```

---

---

# ⚙️ Environment Variables

Create a `.env` in your backend:

```
PORT=3001
MONGO_URI=YOUR_MONGO_STRING
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRATION=30d

CLIENT_URL=https://your-frontend.vercel.app

GEMINI_API_KEY=YOUR_GEMINI_KEY
```

---

---

# ▶️ Running Locally

## Backend

```
cd server
npm install
npm start
```

## Frontend

```
cd client
npm install
npm start
```

---

---

# 🌐 Deployment

### Frontend → **Vercel**

1. `npm run build`
2. Deploy folder `/client`
3. Set env:

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

### Backend → **Render**

1. Connect GitHub repo
2. Set environment variables
3. Start command:

```
node server.js
```

4. Enable CORS correctly:

   * allow Vercel domain
   * allow `*.vercel.app`

---

---

# 📡 WebSocket Events

### Sent

* `join-document`
* `leave-document`
* `text-change`
* `cursor-move`
* `document-saved`

### Received

* `active-users`
* `user-joined`
* `user-left`
* `text-change`
* `cursor-move`

---

---

# 🧠 AI Endpoints

Example:

```
POST /api/ai/enhance
{
  "text": "your content"
}
```

Response:

```
{
  "suggestion": "Improved version..."
}
```

---

# 🎯 Future Improvements

* Version history
* Comments system
* AI tone detection
* Offline editing
* WebRTC-based P2P sync

---
