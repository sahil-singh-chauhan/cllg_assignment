/**
 * pages/LoginPage.jsx
 *
 * Clean, professional login form for Team Task Manager.
 * On success: stores JWT + user in AuthContext → navigates to /dashboard.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);           // store token + user globally
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'radial-gradient(ellipse at 60% 20%, #1e1b4b 0%, #0f1117 60%)' }}>

      {/* Decorative glow blobs */}
      <div style={{
        position: 'fixed', top: '-120px', right: '-100px',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-80px', left: '-60px',
        width: '320px', height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="auth-card" style={{ animation: 'fadeUp 0.4s ease both' }}>

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            {/* Checkmark icon */}
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Team Task Manager
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Error */}
        {error && <div className="error-msg mb-5">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
