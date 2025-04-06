// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import jwtDecode from "jwt-decode";
import api, { authApi } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isSiteAuthenticated, setIsSiteAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const siteToken = localStorage.getItem("site_token");
      const adminToken = localStorage.getItem("admin_token");

      // --- Check Site Auth ---
      if (siteToken) {
        try {
          // Optional: decode and check site token expiration
          // const { exp } = jwtDecode(siteToken);
          // if (Date.now() >= exp * 1000) throw new Error("Site token expired");

          api.defaults.headers.common["Authorization"] = `Bearer ${siteToken}`;
          setIsSiteAuthenticated(true);
        } catch (err) {
          console.warn("Site token invalid or expired");
          localStorage.removeItem("site_token");
          setIsSiteAuthenticated(false);
        }
      }

      // --- Check Admin Auth ---
      if (adminToken) {
        try {
          // Optional: decode and check admin token expiration
          // const { exp } = jwtDecode(adminToken);
          // if (Date.now() >= exp * 1000) throw new Error("Admin token expired");

          api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
          await authApi.admin.verify();
          setIsAdminAuthenticated(true);
        } catch (err) {
          console.warn("Admin token invalid or expired");
          localStorage.removeItem("admin_token");
          setIsAdminAuthenticated(false);
          setError("Admin session expired. Please log in again.");
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // ---- Site Login ----
  const siteLogin = async (password) => {
    setError("");
    try {
      const res = await authApi.site.login(password);
      localStorage.setItem("site_token", res.data.token);

      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setIsSiteAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Site login error", err);
      setError(err.response?.data?.message || "Invalid site password");
      return false;
    }
  };

  // ---- Admin Login ----
  const adminLogin = async (username, password) => {
    setError("");
    try {
      const res = await authApi.admin.login(username, password);

      // ✅ Debug the token
      console.log("Received admin token:", res.data.token);

      // ✅ Save token to localStorage
      localStorage.setItem("admin_token", res.data.token);

      // ✅ Set the default header for future Axios requests
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      setIsAdminAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.message || "Invalid admin credentials");
      return false;
    }
  };

  // ---- Logout (site, admin, or both) ----
  const logout = (type = "both") => {
    if (type === "site" || type === "both") {
      localStorage.removeItem("site_token");
      setIsSiteAuthenticated(false);
    }

    if (type === "admin" || type === "both") {
      localStorage.removeItem("admin_token");
      setIsAdminAuthenticated(false);
    }

    // Clean fallback
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isSiteAuthenticated,
        isAdmin: isAdminAuthenticated,
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
