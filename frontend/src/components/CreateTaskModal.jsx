import { useState } from 'react';
import { createTask } from '../api/tasks';

const inputStyle = {
  background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: 8,
  padding: '0.7rem 1rem', fontSize: '0.95rem', color: '#e2e8f0',
  outline: 'none', width: '100%', fontFamily: 'inherit',
};

export default function CreateTaskModal({ projects, users, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', due_date: '',
    project_id: '', assignee_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        project_id:  parseInt(form.project_id),
        assignee_id: parseInt(form.assignee_id),
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };
      const { data } = await createTask(payload);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to create task.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1a1d27', border: '1px solid #2a2d3a',
        borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 500,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        animation: 'fadeUp 0.25s ease',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Create Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {error && <div className="error-msg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="ct-title">Title</label>
            <input id="ct-title" type="text" placeholder="Task title" required value={form.title} onChange={set('title')} />
          </div>

          <div className="field">
            <label htmlFor="ct-desc">Description <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span></label>
            <textarea id="ct-desc" rows={2} placeholder="What needs to be done?" value={form.description} onChange={set('description')}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div className="field">
            <label htmlFor="ct-project">Project</label>
            <select id="ct-project" required value={form.project_id} onChange={set('project_id')}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">— Select project —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="ct-assignee">Assign To</label>
            <select id="ct-assignee" required value={form.assignee_id} onChange={set('assignee_id')}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">— Select user —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="ct-due">Due Date <span style={{ color: '#475569', fontWeight: 400 }}>(optional)</span></label>
            <input id="ct-due" type="datetime-local" value={form.due_date} onChange={set('due_date')}
              style={inputStyle} />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '0.7rem', borderRadius: 8,
              border: '1px solid #2a2d3a', background: 'transparent',
              color: '#64748b', cursor: 'pointer', fontWeight: 600,
            }}>Cancel</button>
            <button id="ct-submit" type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
