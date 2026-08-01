import { memo, useEffect, useState, useCallback } from 'react';
import portfolio from '../../data/portfolio';
import { sounds } from '../../utils/sound';
import GoogleLoginButton from '../ui/GoogleLoginButton';

const Header = memo(function Header({ activeNav, onTogglePalette, onToggleSound, soundEnabled, mobileMenuOpen, onToggleMobileMenu }) {
  const [user, setUser] = useState(null);

  // Check if user is logged in (from Google or local)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'same-origin' });
        const data = await res.json();
        if (data && data.username) setUser(data);
      } catch {}
    };
    fetchUser();
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    setUser(null);
  }, []);

  return (
    <header className={`header-fixed ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>
      <div className="header-bg" />
      <div className="header-inner">
        <a href="#home" className="header-brand">
          <i className="fas fa-terminal" style={{ color: 'var(--color-success)' }} />~/portfolio
        </a>

        <nav className="nav-container desktop-nav">
          {portfolio.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={sounds.navigate}
              className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon} nav-icon`} />
              <span className="nav-label">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Mobile dropdown menu */}
        <div className="mobile-menu-dropdown">
          {portfolio.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { sounds.navigate(); onToggleMobileMenu(); }}
              className={`nav-link ${activeNav === item.id ? 'active' : ''}`}
            >
              <i className={`fas ${item.icon} nav-icon`} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <div className="mobile-nav-overlay" onClick={onToggleMobileMenu} />

        <div className="header-actions">
          {/* User login / profile section */}
          {user ? (
            <div className="header-user-menu">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="header-user-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="header-user-avatar header-user-avatar-fallback">
                  <i className="fas fa-user" />
                </div>
              )}
              <div className="header-user-info desktop-nav">
                <span className="header-user-name">{user.username}</span>
                <button onClick={handleLogout} className="header-user-logout" title="Logout">
                  <i className="fas fa-right-from-bracket" />
                </button>
              </div>
            </div>
          ) : (
            <GoogleLoginButton redirectPath="/" label="Sign in" variant="header" />
          )}

          <button onClick={onTogglePalette} className="btn-cmd desktop-nav">
            <i className="fas fa-terminal" />
            <span>Command</span>
            <kbd>K</kbd>
          </button>
          <button onClick={onToggleSound} className={`btn-sound ${soundEnabled ? 'on' : 'off'}`} title={soundEnabled ? 'Sound On' : 'Sound Off'}>
            <i className={`fas ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`} />
          </button>
          <button className="mobile-menu-btn" onClick={onToggleMobileMenu} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
});

export default Header;