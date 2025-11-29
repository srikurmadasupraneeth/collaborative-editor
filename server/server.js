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
// ✅ CORS Configuration (IMPORTANT FOR VERCEL + RENDER)
// ------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, curl) OR allowedOrigins OR any vercel.app preview domain
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      console.log("❌ CORS Blocked Origin:", origin);
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
app.use(express.json()); // Body parser
app.use(limiter); // Rate limiter

// ------------------------------
// Routes
// ------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("WorkRadius AI Editor API is running…");
});

// ------------------------------
// Socket.io Setup
// ------------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // same logic as above for socket connections
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("❌ Socket.IO CORS blocked:", origin);
        callback(new Error("Not allowed by socket CORS"));
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
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ------------------------------
// Graceful Shutdown Handler
// ------------------------------
process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Error: ${err.message}`);
  server.close(() => process.exit(1));
});
