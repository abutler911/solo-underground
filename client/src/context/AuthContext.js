// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Verify token with backend
          await axios.get("/api/admin/verify", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Use the api instance instead of axios directly
      const res = await api.post("/api/admin/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Login error", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
