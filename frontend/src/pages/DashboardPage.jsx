import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { getProjects } from '../api/projects';
import { getTasks, updateTaskStatus } from '../api/tasks';
import { getUsers } from '../api/users';

// ─── Helpers ────────────────────────────────────────────────────────────────

const isOverdue = (task) =>
  task.due_date && task.status !== 'COMPLETED' && new Date(task.due_date) < new Date();

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_META = {
  PENDING:     { label: 'Pending',     bg: 'rgba(234,179,8,0.12)',  color: '#facc15', border: 'rgba(234,179,8,0.3)'  },
  IN_PROGRESS: { label: 'In Progress', bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  COMPLETED:   { label: 'Completed',   bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)'  },
};

// ─── Small shared components ────────────────────────────────────────────────

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{
      padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.72rem',
      fontWeight: 700, letterSpacing: '0.04em',
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

function OverduePill() {
  return (
    <span style={{
      padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.68rem',
      fontWeight: 700, background: 'rgba(239,68,68,0.12)',
      color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', marginLeft: 6,
    }}>
      Overdue
    </span>
  );
}

function StatCard({ label, value, emoji, accent }) {
  return (
    <div style={{
      background: '#1a1d27', border: `1px solid ${accent}33`,
      borderRadius: 12, padding: '1.25rem 1.5rem',
      boxShadow: `0 0 20px ${accent}10`,
    }}>
      <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: accent }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ─── Admin View ──────────────────────────────────────────────────────────────

function AdminView({ projects, tasks, users, onStatusUpdate, onCreateProject, onCreateTask }) {
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const userMap    = Object.fromEntries(users.map(u => [u.id, u]));
  const overdue    = tasks.filter(isOverdue);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Projects" value={projects.length} emoji="📁" accent="#6366f1" />
        <StatCard label="Total Tasks"    value={tasks.length}    emoji="✅" accent="#60a5fa" />
        <StatCard label="Overdue Tasks"  value={overdue.length}  emoji="⚠️" accent="#f87171" />
      </div>

      {/* Projects */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Projects</h2>
          <button id="open-create-project" onClick={onCreateProject} style={{
            padding: '0.45rem 1rem', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#818cf8)',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            + Create Project
          </button>
        </div>

        {projects.length === 0 ? (
          <EmptyState text="No projects yet. Create your first project!" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
            {projects.map(p => {
              const count = tasks.filter(t => t.project_id === p.id).length;
              return (
                <div key={p.id} style={{
                  background: '#1a1d27', border: '1px solid #2a2d3a',
                  borderRadius: 12, padding: '1.25rem',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d3a'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.95rem' }}>{p.name}</div>
                  {p.description && <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 10, lineHeight: 1.5 }}>{p.description}</div>}
                  <div style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 600 }}>{count} task{count !== 1 ? 's' : ''}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tasks */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>All Tasks</h2>
          <button id="open-create-task" onClick={onCreateTask} style={{
            padding: '0.45rem 1rem', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#818cf8)',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            + Create Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState text="No tasks yet. Create your first task!" />
        ) : (
          <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2d3a', background: 'rgba(0,0,0,0.2)' }}>
                  {['Title', 'Project', 'Assignee', 'Status', 'Due Date'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => {
                  const over = isOverdue(t);
                  return (
                    <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid #1e2130' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        {t.title}
                        {over && <OverduePill />}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {projectMap[t.project_id]?.name ?? `#${t.project_id}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {t.assignee_id ? (userMap[t.assignee_id]?.name ?? `User #${t.assignee_id}`) : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <StatusBadge status={t.status} />
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: over ? '#f87171' : '#94a3b8', fontSize: '0.85rem', fontWeight: over ? 600 : 400 }}>
                        {fmt(t.due_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Member View ─────────────────────────────────────────────────────────────

function MemberView({ tasks, onStatusUpdate }) {
  if (tasks.length === 0) {
    return (
      <div>
        <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>My Tasks</h2>
        <EmptyState text="You have no tasks assigned yet." />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
        My Tasks <span style={{ color: '#6366f1', marginLeft: 8 }}>{tasks.length}</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {tasks.map(task => <MemberTaskCard key={task.id} task={task} onStatusUpdate={onStatusUpdate} />)}
      </div>
    </div>
  );
}

function MemberTaskCard({ task, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const over = isOverdue(task);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === task.status) return;
    setUpdating(true);
    await onStatusUpdate(task.id, newStatus);
    setUpdating(false);
  };

  return (
    <div style={{
      background: '#1a1d27',
      border: `1px solid ${over ? 'rgba(239,68,68,0.3)' : '#2a2d3a'}`,
      borderRadius: 12, padding: '1.25rem',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
      boxShadow: over ? '0 0 16px rgba(239,68,68,0.06)' : 'none',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{task.title}</span>
          {over && <OverduePill />}
        </div>
        {task.description && (
          <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.55, marginBottom: 8 }}>
            {task.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <StatusBadge status={task.status} />
          {task.due_date && (
            <span style={{ fontSize: '0.78rem', color: over ? '#f87171' : '#64748b', fontWeight: over ? 600 : 400 }}>
              📅 Due {fmt(task.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* Status updater */}
      <div>
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          style={{
            background: '#0f1117', border: '1px solid #2a2d3a',
            borderRadius: 8, padding: '0.45rem 0.75rem',
            fontSize: '0.82rem', color: '#e2e8f0',
            cursor: updating ? 'not-allowed' : 'pointer',
            opacity: updating ? 0.5 : 1,
            outline: 'none',
          }}
        >
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ text }) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem 1rem',
      background: '#1a1d27', border: '1px dashed #2a2d3a',
      borderRadius: 12, color: '#475569',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🗂️</div>
      <p style={{ fontSize: '0.875rem' }}>{text}</p>
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #2a2d3a', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading your workspace…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main DashboardPage ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask,    setShowCreateTask]    = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([getProjects(), getTasks()]);
      setProjects(pRes.data);
      setTasks(tRes.data);
      if (isAdmin) {
        const uRes = await getUsers();
        setUsers(uRes.data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setShowCreateProject(false);
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [...prev, newTask]);
    setShowCreateTask(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page heading */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
            {isAdmin
              ? 'Manage all projects and tasks across your team.'
              : 'Track and update your assigned tasks.'}
          </p>
        </div>

        {isAdmin
          ? <AdminView
              projects={projects} tasks={tasks} users={users}
              onStatusUpdate={handleStatusUpdate}
              onCreateProject={() => setShowCreateProject(true)}
              onCreateTask={() => setShowCreateTask(true)}
            />
          : <MemberView tasks={tasks} onStatusUpdate={handleStatusUpdate} />
        }
      </main>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreated={handleProjectCreated}
        />
      )}
      {showCreateTask && (
        <CreateTaskModal
          projects={projects} users={users}
          onClose={() => setShowCreateTask(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
