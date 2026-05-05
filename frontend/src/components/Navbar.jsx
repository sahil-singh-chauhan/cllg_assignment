import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(15,17,23,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #2a2d3a',
        boxShadow: '0 1px 0 rgba(99,102,241,0.08)',
      }}>

      {/* Brand */}
      <div className="flex items-center gap-3">
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#6366f1,#818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
        }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>
          Team Task Manager
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
          padding: '0.2rem 0.65rem', borderRadius: 999,
          background: isAdmin ? 'rgba(99,102,241,0.18)' : 'rgba(34,197,94,0.12)',
          color: isAdmin ? '#818cf8' : '#4ade80',
          border: `1px solid ${isAdmin ? 'rgba(99,102,241,0.35)' : 'rgba(34,197,94,0.3)'}`,
        }}>
          {user?.role}
        </span>
        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{user?.name}</span>
        <button id="navbar-logout" onClick={handleLogout} style={{
          padding: '0.4rem 0.9rem', borderRadius: 8,
          border: '1px solid #2a2d3a', background: 'transparent',
          color: '#64748b', fontSize: '0.85rem', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#6366f1'; }}
          onMouseLeave={e => { e.target.style.color = '#64748b'; e.target.style.borderColor = '#2a2d3a'; }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
