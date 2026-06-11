// ============================================
// FEAST API Client — Axios with JWT Interceptors
// ============================================
import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: inject JWT token ──
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: auto-refresh on 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    // Skip interceptor for auth endpoints — let the caller handle credentials errors
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        // Save new tokens
        saveTokens({
          access: data.data.access,
          refresh: data.data.refresh,
        });

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.access}`;
        return axios(originalRequest);
      } catch {
        // Refresh also failed — force logout
        clearTokens();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
