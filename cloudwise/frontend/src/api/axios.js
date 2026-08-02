import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cloudwise_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response at all means the request never reached the server —
    // backend is down, no internet, CORS block, or a timeout. Normalize
    // this into the same { response: { data: { message } } } shape the
    // rest of the app already reads, so every page's existing
    // `err.response?.data?.message` fallback picks up a friendly message
    // for free, without needing to touch every call site.
    if (!error.response) {
      const message =
        error.code === "ECONNABORTED"
          ? "The request timed out. Please try again."
          : "Network error — please check your connection or that the server is running.";
      error.response = { data: { message } };
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      localStorage.removeItem("cloudwise_token");
      localStorage.removeItem("cloudwise_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;