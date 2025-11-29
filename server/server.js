// server/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Imports
const connectDB = require("./config/db");
const limiter = require("./middleware/rateLimiter");
const { socketAuth, documentHandler } = require("./websockets/documentHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Initialize App
const app = express();
const PORT = process.env.PORT || 3001;

// ------------------------------
// ✅ Connect to Database
// ------------------------------
connectDB();

// ------------------------------
// ✅ ALLOWED ORIGINS
// ------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// ------------------------------
// ✅ EXPRESS CORS — (WORKS FOR API)
// ------------------------------
const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      console.log("❌ HTTP CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ------------------------------
// Middleware
// ------------------------------
app.use(express.json());
app.use(limiter);

// ------------------------------
// Routes
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("WorkRadius AI Editor API is running…");
});

// ------------------------------
// 🔥 SOCKET.IO (FIXED CORS!!!)
// ------------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("❌ Socket.IO CORS Blocked:", origin);
        callback(new Error("Socket CORS blocked"));
      }
    },
    credentials: true,
  },
  path: "/socket.io",
});

// Apply JWT socket authentication
io.use(socketAuth);

// Document collaboration socket handlers
documentHandler(io);

// ------------------------------
// Start Server
// ------------------------------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Error: ${err.message}`);
  server.close(() => process.exit(1));
});
