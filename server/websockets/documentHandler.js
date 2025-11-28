// server/websockets/documentHandler.js
const Document = require("../models/Document");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const activeUsers = {};

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.id;
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
};

const documentHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id} (User ID: ${socket.user})`);

    socket.on("join-document", async (documentId) => {
      if (!documentId) return;

      socket.join(documentId);
      socket.documentId = documentId;

      const user = await User.findById(socket.user).select("username");
      if (!user) {
        console.warn(`User ${socket.user} not found.`);
        return;
      }

      if (!activeUsers[documentId]) {
        activeUsers[documentId] = new Map();
      }

      const newUserInfo = {
        userId: socket.user,
        username: user.username,
        socketId: socket.id,
        cursorPosition: null,
      };
      activeUsers[documentId].set(socket.id, newUserInfo);

      const roomUsers = Array.from(activeUsers[documentId].values());
      io.to(documentId).emit("user-joined", newUserInfo);

      socket.emit("active-users", roomUsers);
      console.log(`${user.username} joined document ${documentId}`);
    });

    socket.on("text-change", (delta) => {
      if (!socket.documentId) return;

      socket.broadcast.to(socket.documentId).emit("text-change", delta);
    });

    socket.on("cursor-move", (cursorPosition) => {
      if (!socket.documentId || !activeUsers[socket.documentId]) return;

      const user = activeUsers[socket.documentId].get(socket.id);
      if (user) {
        user.cursorPosition = cursorPosition;
        socket.broadcast.to(socket.documentId).emit("cursor-move", {
          userId: socket.user,
          cursorPosition: cursorPosition,
        });
      }
    });

    socket.on("document-saved", (documentId) => {
      if (!documentId) return;
      socket.broadcast.to(documentId).emit("document-saved", {
        message: "Document saved by a collaborator.",
      });
    });

    const handleLeave = () => {
      if (!socket.documentId) return;

      const documentId = socket.documentId;

      if (activeUsers[documentId]) {
        activeUsers[documentId].delete(socket.id);
        if (activeUsers[documentId].size === 0) {
          delete activeUsers[documentId];
        }
      }

      socket.broadcast.to(documentId).emit("user-left", {
        userId: socket.user,
        socketId: socket.id,
      });
      console.log(`User ${socket.user} left document ${documentId}.`);
      socket.leave(documentId);
    };

    socket.on("leave-document", handleLeave);

    socket.on("disconnect", handleLeave);
  });
};

module.exports = { documentHandler, socketAuth };
