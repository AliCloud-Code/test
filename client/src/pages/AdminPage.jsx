import { useState, useEffect, useCallback } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'same-origin' });
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
          setUsername(data.username || 'admin');
        }
      } catch {} 
      finally { setChecking(false); }
    };
    check();
  }, []);

  const handleLogin = useCallback((user) => {
    setAuthenticated(true);
    setUsername(user);
  }, []);

  const handleLogout = useCallback(() => {
    setAuthenticated(false);
    setUsername('');
  }, []);

  if (checking) {
    return (
      <div className="admin-login-page">
        <div className="admin-bg">
          <div className="admin-bg-orb admin-bg-orb-1" />
          <div className="admin-bg-orb admin-bg-orb-2" />
        </div>
        <div className="admin-login-card" style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#8b5cf6' }} />
          <p style={{ marginTop: '1rem', color: 'rgba(200,185,240,0.45)' }}>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard username={username} onLogout={handleLogout} />;
}