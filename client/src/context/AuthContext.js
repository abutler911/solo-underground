// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Two separate auth states for site access and admin access
  const [isSiteAuthenticated, setIsSiteAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      // Check site access first
      const siteToken = localStorage.getItem("site_token");
      if (siteToken) {
        try {
          // Set default headers for all future requests
          api.defaults.headers.common["Authorization"] = `Bearer ${siteToken}`;
          setIsSiteAuthenticated(true);
        } catch (err) {
          localStorage.removeItem("site_token");
          setIsSiteAuthenticated(false);
        }
      }

      // Then check admin access if needed
      const adminToken = localStorage.getItem("admin_token");
      if (adminToken) {
        try {
          // Verify admin token with backend
          await api.get("/api/admin/verify", {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          setIsAdminAuthenticated(true);
        } catch (err) {
          localStorage.removeItem("admin_token");
          setIsAdminAuthenticated(false);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Site login function
  const siteLogin = async (password) => {
    setError("");
    try {
      const res = await api.post("/api/auth/site-access", { password });
      localStorage.setItem("site_token", res.data.token);

      // Set default headers for all future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      setIsSiteAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Site login error", err);
      setError(err.response?.data?.message || "Invalid site password");
      return false;
    }
  };

  // Admin login function (existing one)
  const adminLogin = async (username, password) => {
    setError("");
    try {
      const res = await api.post("/api/admin/login", {
        username,
        password,
      });
      localStorage.setItem("admin_token", res.data.token);
      setIsAdminAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Admin login error", err);
      setError(err.response?.data?.message || "Invalid admin credentials");
      return false;
    }
  };

  // Logout function
  const logout = (type = "both") => {
    if (type === "site" || type === "both") {
      localStorage.removeItem("site_token");
      setIsSiteAuthenticated(false);
    }

    if (type === "admin" || type === "both") {
      localStorage.removeItem("admin_token");
      setIsAdminAuthenticated(false);
    }

    // If logging out of site, also log out of admin
    if (type === "site") {
      localStorage.removeItem("admin_token");
      setIsAdminAuthenticated(false);
    }
  };

  // Combined authentication status
  const isAuthenticated = isSiteAuthenticated;
  const isAdmin = isAdminAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        loading,
        error,
        siteLogin,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
