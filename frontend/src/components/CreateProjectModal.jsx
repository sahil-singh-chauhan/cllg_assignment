import { useState } from 'react';
import { createProject } from '../api/projects';

export default function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await createProject(form);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to create project.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1a1d27', border: '1px solid #2a2d3a',
        borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'fadeUp 0.25s ease',
      }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Create Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {error && <div className="error-msg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="cp-name">Project Name</label>
            <input id="cp-name" type="text" placeholder="e.g. Website Redesign" required
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="cp-desc">Description <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span></label>
            <textarea id="cp-desc" placeholder="Brief project description…" rows={3}
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              style={{
                background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: 8,
                padding: '0.7rem 1rem', fontSize: '0.95rem', color: '#e2e8f0',
                resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              }} />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.7rem', borderRadius: 8,
              border: '1px solid #2a2d3a', background: 'transparent',
              color: '#64748b', cursor: 'pointer', fontWeight: 600,
            }}>Cancel</button>
            <button id="cp-submit" type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
