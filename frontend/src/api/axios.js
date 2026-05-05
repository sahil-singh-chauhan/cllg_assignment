/**
 * api/axios.js
 *
 * Pre-configured Axios instance for the Team Task Manager API.
 *
 * - baseURL points to the FastAPI backend (proxied via Vite in dev).
 * - A request interceptor automatically attaches the Bearer JWT from
 *   localStorage to every outgoing request, so individual callers
 *   never need to think about auth headers.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',            // Vite dev proxy forwards to http://localhost:8000
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
