// server/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Config and Middleware
dotenv.config();
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

// Database Connection
connectDB();

// CORS Configuration (Crucial for frontend communication)
const corsOptions = {
  origin: process.env.CLIENT_URL, // e.g., 'http://localhost:3000'
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies/auth headers
};
app.use(cors(corsOptions));

// Built-in Middleware
app.use(express.json()); // Body parser for raw JSON
app.use(limiter); // Apply rate limiting to all API requests

// --- HTTP Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);

// Simple health check route
app.get("/", (req, res) => {
  res.send("WorkRadius AI Editor API is running...");
});

// --- Socket.io Setup ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
  // Authentication token passed via socket handshake
  // e.g., socket.handshake.auth.token = 'Bearer xyz'
  path: "/socket.io",
});

// Apply JWT authentication to all incoming socket connections
io.use(socketAuth);

// Register the document collaboration handlers
documentHandler(io);

// Start the Server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown (optional but good practice)
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
