import { useState, useCallback } from 'react';
import GoogleLoginButton from '../components/ui/GoogleLoginButton';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user.username);
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [username, password, onLogin]);

  return (
    <div className="admin-login-page">
      <div className="admin-bg">
        <div className="admin-bg-orb admin-bg-orb-1" />
        <div className="admin-bg-orb admin-bg-orb-2" />
      </div>
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <i className="fas fa-shield-halved" />
        </div>
        <h2 className="admin-login-title">Admin Access</h2>
        <p className="admin-login-sub">Secure panel — authorized personnel only</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Username</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="admin"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Password</label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin" /> Authenticating...</>
            ) : (
              <><i className="fas fa-lock-open" /> Sign In</>
            )}
          </button>
        </form>

        <div className="admin-login-divider">
          <span>or</span>
        </div>

        <GoogleLoginButton
          redirectPath={window.__ADMIN_PATH || '/admin'}
          label="Sign in with Google"
        />
      </div>
    </div>
  );
}