/**
 * Axios Instance
 * Configured HTTP client with auth token injection and error handling
 */

import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// ── Request Interceptor ────────────────────────────────────────────────────────
// Automatically adds JWT token to every request if user is logged in
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (stored on login)
    const token = localStorage.getItem('akshraa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid → clear auth and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('akshraa_token');
      localStorage.removeItem('akshraa_user');
      // Redirect to login page (use window.location to avoid React Router import)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
