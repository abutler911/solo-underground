// client/src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("site_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin API request helper
const adminRequest = async (method, url, data = null) => {
  const adminToken = localStorage.getItem("admin_token");
  if (!adminToken) {
    throw new Error("Admin authentication required");
  }
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    };
    console.log(`Making ${method.toUpperCase()} request to ${url}:`, data);
    let response;
    if (method.toLowerCase() === "get") {
      response = await api.get(url, config);
    } else if (method.toLowerCase() === "post") {
      response = await api.post(url, data, config);
    } else if (method.toLowerCase() === "put") {
      response = await api.put(url, data, config);
    } else if (method.toLowerCase() === "delete") {
      response = await api.delete(url, config);
    }
    console.log(`Response from ${method.toUpperCase()} ${url}:`, response.data);
    return response;
  } catch (error) {
    console.error(`Admin API error (${method} ${url}):`, error);
    throw error;
  }
};

// Auth API - centralized functions for authentication
const authApi = {
  // Site authentication endpoints
  site: {
    login: (password) => api.post("/api/auth/site-access", { password }),
    verify: () => api.get("/api/auth/verify"),
  },
  // Admin authentication endpoints
  admin: {
    login: (username, password) =>
      api.post(
        "/api/auth/admin/login",
        { username, password },
        { headers: { Authorization: "" } }
      ),
    verify: () =>
      api.get("/api/auth/admin/verify", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      }),
  },
};

// Articles API - centralized functions for article operations
const articlesApi = {
  // Public article endpoints (requires site authentication)
  getAll: () => api.get("/api/articles"),
  getById: (id) => api.get(`/api/articles/${id}`),

  // Admin article endpoints
  admin: {
    getAll: () => adminRequest("get", "/api/admin/articles"),
    getById: (id) => adminRequest("get", `/api/admin/articles/${id}`),
    getDrafts: () => adminRequest("get", "/api/admin/staging"),
    create: (data) => adminRequest("post", "/api/admin/articles", data),
    update: (id, data) =>
      adminRequest("put", `/api/admin/articles/${id}`, data),
    delete: (id) => adminRequest("delete", `/api/admin/articles/${id}`),
    publish: (id) => adminRequest("put", `/api/admin/articles/${id}/publish`),
    markForRewrite: (id) =>
      adminRequest("put", `/api/admin/articles/${id}/needs-rewrite`),
  },
};

// Export everything
export { api, adminRequest, articlesApi, authApi };
export default api;
