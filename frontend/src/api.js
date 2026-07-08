// src/api.js
import axios from "axios";

// Falls back to localhost for local dev; set VITE_API_URL in the environment
// (see .env / .env.production) when deploying so the frontend doesn't try to
// reach the visitor's own machine instead of your real backend.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5005";

const api = axios.create({ baseURL });

const TOKEN_KEY = "streampure_token";

// Attach the logged-in user's JWT (if any) to every request. Kept here
// rather than inside AuthContext so any module (including playerContext)
// can just import `api` and get authenticated requests for free.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { TOKEN_KEY };
export default api;
