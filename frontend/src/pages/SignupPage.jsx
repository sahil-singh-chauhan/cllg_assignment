/**
 * pages/SignupPage.jsx
 *
 * Registration form for Team Task Manager.
 * On success: stores JWT + user in AuthContext → navigates to /dashboard.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'MEMBER',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Register the user
      await api.post('/auth/signup', form);
      // 2. Immediately log them in to get the token
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      login(data);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
         style={{ background: 'radial-gradient(ellipse at 40% 80%, #1e1b4b 0%, #0f1117 60%)' }}>

      {/* Glow blobs */}
      <div style={{
        position: 'fixed', top: '-80px', left: '-80px',
        width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', right: '-60px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="auth-card" style={{ animation: 'fadeUp 0.4s ease both' }}>

        {/* Brand */}
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Join the Team Task Manager workspace
          </p>
        </div>

        {/* Error */}
        {error && <div className="error-msg mb-5">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          <div className="field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signup-role">Role</label>
            <select
              id="signup-role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            id="signup-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
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
