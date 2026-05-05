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
 * Slow-server detection:
 *   If a request takes longer than 3 s, a `server-slow` CustomEvent is
 *   dispatched on window. When it finishes, `server-ready` is dispatched.
 *   ServerWakingBanner.jsx listens for these to show a friendly message.
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

// ---------------------------------------------------------------------------
// Slow-server detection
// ---------------------------------------------------------------------------
const SLOW_THRESHOLD = 3000; // ms

// Track in-flight slow requests — hide banner only when ALL finish.
let slowRequestCount = 0;

function notifySlow() {
  slowRequestCount += 1;
  window.dispatchEvent(new CustomEvent('server-slow'));
}

function notifyReady() {
  if (slowRequestCount > 0) {
    slowRequestCount -= 1;
    if (slowRequestCount === 0) {
      window.dispatchEvent(new CustomEvent('server-ready'));
    }
  }
}

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT + start slow timer
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Each request carries its own timer so concurrent requests don't clash
  config._slowTimer = setTimeout(notifySlow, SLOW_THRESHOLD);
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptors — clear timer, notify ready, handle 401
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    clearTimeout(response.config._slowTimer);
    notifyReady();
    return response;
  },
  (error) => {
    if (error.config?._slowTimer) {
      clearTimeout(error.config._slowTimer);
      notifyReady();
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Let the ProtectedRoute / AuthContext handle the redirect
    }
    return Promise.reject(error);
  }
);

export default api;
