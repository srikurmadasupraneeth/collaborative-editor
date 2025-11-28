import { io } from "socket.io-client";

const SOCKET_URL = "https://collaborative-editor-gdfh.onrender.com";

export const initializeSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Socket connection failed: No JWT token found.");
    return null;
  }

  const socket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token },
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log(`Socket connected: ${socket.id}`);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });

  return socket;
};

export const disconnectSocket = (socket) => {
  if (socket) {
    socket.disconnect();
    console.log("Socket intentionally disconnected.");
  }
};
