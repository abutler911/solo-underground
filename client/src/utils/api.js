// client/src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
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

    return response;
  } catch (error) {
    console.error(`Admin API error (${method} ${url}):`, error);
    throw error;
  }
};

// Export the helper function
export { adminRequest };
export default api;
