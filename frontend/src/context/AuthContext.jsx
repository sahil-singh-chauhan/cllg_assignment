/**
 * context/AuthContext.jsx
 *
 * Global authentication state for the Team Task Manager frontend.
 *
 * Provides:
 *   - user      : { id, name, email, role } | null
 *   - token     : string | null
 *   - login(data) : stores token + user in state AND localStorage
 *   - logout()    : clears state AND localStorage
 *   - isAdmin   : boolean shorthand
 *   - loading   : true while initial localStorage hydration is in progress
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // hydrating from localStorage

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedUser  = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted storage – start fresh
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Call this after a successful /api/auth/login response.
   * @param {{ access_token: string, user: object }} data – raw API response body
   */
  const login = (data) => {
    const { access_token, user: userData } = data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook – use anywhere inside <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
