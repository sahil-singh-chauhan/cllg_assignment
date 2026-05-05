/**
 * ServerWakingBanner.jsx
 *
 * A fixed toast banner that appears whenever an API request takes longer
 * than 3 seconds (i.e. the Render free-tier backend is waking up from sleep).
 *
 * Listens for two custom DOM events fired by api/axios.js:
 *   - `server-slow`  → show the banner
 *   - `server-ready` → hide the banner
 *
 * Mount this once at the app root (App.jsx) so it works on every page.
 */

import { useEffect, useState } from 'react';

export default function ServerWakingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    window.addEventListener('server-slow',  show);
    window.addEventListener('server-ready', hide);

    return () => {
      window.removeEventListener('server-slow',  show);
      window.removeEventListener('server-ready', hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        {/* Spinner */}
        <span style={styles.spinner} />

        <div>
          <p style={styles.title}>Server is waking up…</p>
          <p style={styles.subtitle}>
            The backend is starting after a period of inactivity.
            This usually takes 20–30 seconds. Please wait.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles — no extra CSS file needed
// ---------------------------------------------------------------------------
const styles = {
  wrapper: {
    position:       'fixed',
    bottom:         '1.5rem',
    left:           '50%',
    transform:      'translateX(-50%)',
    zIndex:         9999,
    pointerEvents:  'none',   // don't block clicks below
  },
  banner: {
    display:        'flex',
    alignItems:     'center',
    gap:            '0.75rem',
    background:     'rgba(17, 24, 39, 0.92)',   // dark, semi-transparent
    color:          '#f9fafb',
    padding:        '0.75rem 1.25rem',
    borderRadius:   '0.75rem',
    boxShadow:      '0 8px 32px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(8px)',
    fontSize:       '0.875rem',
    maxWidth:       '420px',
    animation:      'slideUp 0.3s ease',
    pointerEvents:  'auto',
  },
  title: {
    margin:       0,
    fontWeight:   600,
    marginBottom: '0.15rem',
  },
  subtitle: {
    margin:   0,
    opacity:  0.75,
    fontSize: '0.8rem',
  },
  spinner: {
    display:       'block',
    flexShrink:    0,
    width:         '1.25rem',
    height:        '1.25rem',
    border:        '2.5px solid rgba(255,255,255,0.25)',
    borderTop:     '2.5px solid #ffffff',
    borderRadius:  '50%',
    animation:     'spin 0.8s linear infinite',
  },
};
