# 📝 WorkRadius AI Collaborative Editor

### Google-Docs-Style Realtime Editor with AI Assistant (MERN + Socket.io + Gemini AI)

A fully functional **real-time collaborative text editor** with:
✔ Multi-user editing
✔ Live cursor tracking
✔ AI writing assistant (Gemini 2.5 Flash)
✔ Secure authentication
✔ Document sharing
✔ Autosave
✔ Online/offline collaborator presence
✔ Deployed backend + frontend

---

## 🌐 Live Demo

| Service               | URL                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend (Vercel)** | [https://collaborative-editor-lfdg38i7o-srikurmadasupraneeths-projects.vercel.app](https://collaborative-editor-lfdg38i7o-srikurmadasupraneeths-projects.vercel.app) |
| **Backend (Render)**  | [https://collaborative-editor-gdfh.onrender.com](https://collaborative-editor-gdfh.onrender.com)                                                                     |

---

## 🚀 Tech Stack

### **Frontend**

* React.js
* React-Quill (rich text editor)
* Quill-Cursors (multiplayer cursors)
* Axios
* Bootstrap

### **Backend**

* Node.js + Express
* MongoDB (Atlas)
* JWT Authentication
* Socket.io (Realtime Collaboration)
* Google Gemini 2.5 Flash for AI
* Rate limiting, security middleware

### **Deployment**

* **Frontend** → Vercel
* **Backend** → Render
* CORS enabled for all Vercel preview URLs

---

## 🔐 Features Implemented

### 1️⃣ **User Authentication**

✔ Register, Login, Logout
✔ JWT-based authentication
✔ Protected routes
✔ Auto-login using saved token
✔ Secure password hashing (bcrypt)

---

### 2️⃣ **Document Management**

✔ Create new documents
✔ List all documents shared with the user
✔ Autosave every 30 seconds
✔ Manual Save
✔ Delete documents (owner only)
✔ Role-based access

* **Owner**
* **Editor**
* **Viewer**

---

### 3️⃣ **Real-Time Collaboration (Socket.io)**

✔ Live text synchronization
✔ Real-time cursor tracking using Quill-Cursors
✔ Multi-user presence (online/offline indicator)
✔ Join/leave document rooms
✔ Broadcast content changes instantly
✔ Broadcast cursor movement instantly

---

### 4️⃣ **AI Writing Assistant (Gemini 2.5 Flash)**

Integrated with 5 powerful features:

✔ Grammar & Style Check
✔ Enhance Writing
✔ Summarize Text
✔ Smart Auto-Completion
✔ Smart Suggestions (context-aware)

Includes:

* Rate limiting
* Retry logic for AI API failures
* Live AI suggestions as user types

---

### 5️⃣ **Security Features**

✔ Rate limiting (100 requests/15 min per IP)
✔ Protected API routes
✔ Protected socket connections (JWT in handshake)
✔ Sanitized input
✔ CORS restrictions (supports all Vercel preview URLs)
✔ Environment variables for secrets
✔ Prevent unauthorized access to documents

---

## 🏗 Project Structure

```
/server
  /config        # DB, JWT, Gemini setup
  /models        # User & Document models
  /routes        # auth, documents, ai
  /websockets    # socket handlers
  /middleware    # auth + rate limiting
  /services      # Gemini AI service
  server.js

/client
  /src
    /components  # Navbar, AI Assistant
    /pages       # Auth, DocumentList, EditorPage
    /services    # Socket client
    /api         # Axios wrappers
    /hooks       # Auth hook
    App.js
    index.js
```

---

## ⚙️ Installation & Setup (Local Development)

### 1️⃣ Clone Repo

```bash
git clone <your-repo-url>
cd project-folder
```

---

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```
PORT=3001
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

Run server:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

---

## 🔌 WebSocket Events Implemented

### Client → Server

* `join-document`
* `leave-document`
* `text-change`
* `cursor-move`
* `document-saved`

### Server → Client

* `active-users`
* `user-joined`
* `user-left`
* `text-change`
* `cursor-move`

---

## 🔮 Future Improvements

These can be added easily:

⭐ Document version history
⭐ Comments + suggestions mode
⭐ Offline mode
⭐ AI tone analysis
⭐ Full multi-cursor avatars
⭐ Export to PDF / Word

---
