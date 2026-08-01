import { useState, useEffect, useCallback } from 'react';
import { sounds } from '../utils/sound';

const API = '/api';
const LIMIT = 20;

const escapeHtml = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export default function AdminDashboard({ username, onLogout }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, unread: 0, todayCount: 0 });
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const playNotify = useCallback(() => {
    try { sounds.success(); } catch {}
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('auth');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      if (e.message === 'auth') onLogout();
    }
  }, [onLogout]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/messages?page=${page}&limit=${LIMIT}&filter=${filter}`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('auth');
      const data = await res.json();
      setMessages(data.messages);
      setPagination(data.pagination);
      setError('');
    } catch (e) {
      if (e.message === 'auth') { onLogout(); return; }
      setError('Error loading messages.');
    } finally {
      setLoading(false);
    }
  }, [page, filter, onLogout]);

  useEffect(() => { loadStats(); loadMessages(); }, [loadStats, loadMessages]);

  const handleToggleRead = async (id) => {
    playNotify();
    await fetch(`${API}/admin/messages/${id}/read`, { method: 'PATCH', credentials: 'same-origin' });
    loadStats();
    loadMessages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await fetch(`${API}/admin/messages/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    loadStats();
    loadMessages();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ Delete ALL messages? This cannot be undone!')) return;
    await fetch(`${API}/admin/messages`, { method: 'DELETE', credentials: 'same-origin' });
    loadStats();
    loadMessages();
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'same-origin' });
    onLogout();
  };

  const changeFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-bg">
        <div className="admin-bg-orb admin-bg-orb-1" />
        <div className="admin-bg-orb admin-bg-orb-2" />
      </div>
      <div className="admin-dashboard-inner">
        {/* Header */}
        <div className="admin-dash-header">
          <div className="admin-dash-header-left">
            <i className="fas fa-shield-halved admin-dash-logo" />
            <h1>Messages Dashboard</h1>
          </div>
          <div className="admin-dash-header-right">
            <span className="admin-dash-user">
              <i className="fas fa-user-shield" /> {username}
            </span>
            <button className="admin-btn-sm" onClick={handleLogout}>
              <i className="fas fa-right-from-bracket" /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-row">
          <div className="admin-stat-box">
            <div className="admin-stat-icon"><i className="fas fa-envelope" /></div>
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-label">Total Messages</div>
          </div>
          <div className="admin-stat-box">
            <div className="admin-stat-icon"><i className="fas fa-circle-exclamation" /></div>
            <div className="admin-stat-value admin-stat-unread">{stats.unread}</div>
            <div className="admin-stat-label">Unread</div>
          </div>
          <div className="admin-stat-box">
            <div className="admin-stat-icon"><i className="fas fa-calendar-day" /></div>
            <div className="admin-stat-value">{stats.todayCount}</div>
            <div className="admin-stat-label">Today</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              className={`admin-tab-btn ${filter === f ? 'active' : ''}`}
              onClick={() => changeFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button className="admin-btn-danger" onClick={handleDeleteAll}>
            <i className="fas fa-trash" /> Delete All
          </button>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="admin-empty">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }} />
            Loading messages...
          </div>
        ) : error ? (
          <div className="admin-empty">
            <i className="fas fa-triangle-exclamation" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }} />
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="admin-empty">
            <i className="fas fa-inbox" />
            No messages found.
          </div>
        ) : (
          <div className="admin-messages-list">
            {messages.map((m) => (
              <div key={m.id} className={`admin-msg-card ${m.read ? '' : 'unread'}`}>
                <div className="admin-msg-card-header">
                  <span className="admin-msg-card-name">{escapeHtml(m.name)}</span>
                  <span className="admin-msg-card-email">{escapeHtml(m.email)}</span>
                </div>
                <div className="admin-msg-card-subject">
                  <i className="fas fa-tag" /> {escapeHtml(m.subject)}
                </div>
                <div className="admin-msg-card-body">{escapeHtml(m.message)}</div>
                <div className="admin-msg-card-meta">
                  <span><i className="fas fa-clock" /> {new Date(m.createdAt).toLocaleString()}</span>
                  <span><i className="fas fa-globe" /> {escapeHtml(m.ip || '—')}</span>
                  <span>{m.read ? '✅ Read' : '🔵 Unread'}</span>
                </div>
                <div className="admin-msg-card-actions">
                  <button className="admin-action-btn" onClick={() => handleToggleRead(m.id)}>
                    <i className={`fas ${m.read ? 'fa-envelope' : 'fa-envelope-open'}`} />
                    {' '}{m.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button className="admin-action-btn del" onClick={() => handleDelete(m.id)}>
                    <i className="fas fa-trash" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((i) => i < 3 || i > pagination.totalPages - 2 || Math.abs(i - page) < 2)
              .map((i, idx, arr) => (
                <span key={i}>
                  {idx > 0 && arr[idx - 1] !== i - 1 && (
                    <span style={{ color: 'var(--color-text-tertiary)' }}>…</span>
                  )}
                  <button
                    className={`admin-page-btn ${i === page ? 'active' : ''}`}
                    onClick={() => setPage(i)}
                  >
                    {i}
                  </button>
                </span>
              ))}
            <button
              className="admin-page-btn"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}