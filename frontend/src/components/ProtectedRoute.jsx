/**
 * components/ProtectedRoute.jsx
 *
 * Route guard that enforces authentication.
 * - If auth state is still loading (hydrating localStorage), shows nothing.
 * - If not logged in → redirect to /login.
 * - Otherwise → render the child route.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Wait for localStorage hydration before making a redirect decision
  if (loading) return null;

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
