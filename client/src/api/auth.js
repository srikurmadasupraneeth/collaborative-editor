// client/src/api/auth.js
import api from "./api";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const logout = () => {
  localStorage.removeItem("token");
  return api.post("/auth/logout");
};
