// client/src/hooks/useAuth.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { login, register, logout, getMe } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data);
          localStorage.setItem("user_id", res.data._id);
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          console.error("Failed to load user:", error.message);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogin = async (credentials) => {
    const res = await login(credentials);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user_id", res.data._id);

    setUser(res.data);
    return res.data;
  };

  const handleRegister = async (userData) => {
    const res = await register(userData);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user_id", res.data._id);

    setUser(res.data);
    return res.data;
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
