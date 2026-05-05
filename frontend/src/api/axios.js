/**
 * api/axios.js
 *
 * Pre-configured Axios instance for the Team Task Manager API.
 *
 * baseURL resolution:
 *   - In production: VITE_API_URL must be set to the full backend URL,
 *     e.g. https://your-backend.up.railway.app/api
 *   - In local dev: falls back to '/api', which Vite proxies to
 *     http://localhost:8000/api automatically.
 *
 * A request interceptor automatically attaches the Bearer JWT from
 * localStorage to every outgoing request.
 */

import axios from 'axios';

// Vite exposes env vars prefixed with VITE_ via import.meta.env
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT on every request if one is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler – on 401, wipe local storage so the
// ProtectedRoute guard redirects to /login automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Let the ProtectedRoute / AuthContext handle the redirect
    }
    return Promise.reject(error);
  }
);

export default api;
