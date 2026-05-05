/**
 * App.jsx — Root router configuration for Team Task Manager.
 *
 * Route map:
 *   /              → redirect to /dashboard
 *   /login         → LoginPage  (public)
 *   /signup        → SignupPage (public)
 *   /dashboard     → DashboardPage (protected — requires auth)
 *
 * Public routes (/login, /signup) redirect already-logged-in users
 * straight to /dashboard so they don't see the auth pages unnecessarily.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

/** Redirect logged-in users away from /login and /signup */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public */}
        <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected (requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
