import { useMemo, useEffect, useState, useCallback } from 'react';
import portfolio from '../../data/portfolio';

export default function CommandPalette({ show, onClose, theme, setTheme, toggleSoundFn }) {
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);

  const items = useMemo(() => [
    ...portfolio.nav.map(n => ({ type: 'nav', ...n })),
    { type: 'action', id: 'toggle-sound', label: 'Toggle Sound', icon: 'fa-volume-high', action: toggleSoundFn },
    { type: 'action', id: 'github', label: 'Open GitHub', icon: 'fa-github', action: () => window.open('https://github.com/AliCloud-Code') },
    { type: 'action', id: 'download-cv', label: 'Download CV', icon: 'fa-file-arrow-down', action: () => {} },
    { type: 'theme', id: 'theme-default', label: 'Default Theme', icon: 'fa-circle', action: () => setTheme('default'), color: '#007AFF' },
    { type: 'theme', id: 'theme-cyber', label: 'Cyber Theme', icon: 'fa-circle', action: () => setTheme('cyber'), color: '#0ff' },
    { type: 'theme', id: 'theme-sunset', label: 'Sunset Theme', icon: 'fa-circle', action: () => setTheme('sunset'), color: '#ff6b35' },
    { type: 'theme', id: 'theme-purple', label: 'Purple Theme', icon: 'fa-circle', action: () => setTheme('purple'), color: '#a855f7' },
    { type: 'theme', id: 'theme-ocean', label: 'Ocean Theme', icon: 'fa-circle', action: () => setTheme('ocean'), color: '#0ea5e9' },
    { type: 'theme', id: 'theme-matrix', label: 'Matrix Theme', icon: 'fa-circle', action: () => setTheme('matrix'), color: '#0f0' },
  ], [toggleSoundFn, setTheme]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(i => i.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => { setIdx(0); }, [query]);

  const execute = useCallback((item) => {
    if (item.type === 'nav') {
      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      item.action?.();
    }
    onClose();
  }, [onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => i + 1 < filtered.length ? i + 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => i - 1 >= 0 ? i - 1 : filtered.length - 1); }
    else if (e.key === 'Enter' && filtered[idx]) execute(filtered[idx]);
    else if (e.key === 'Escape') onClose();
  };

  if (!show) return null;

  const navItems = filtered.filter(i => i.type === 'nav');
  const otherItems = filtered.filter(i => i.type !== 'nav');

  return (
    <div className="palette-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette-dialog">
        <div className="palette-search">
          <i className="fas fa-search palette-search-icon" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="palette-input"
          />
        </div>
        <div className="palette-list">
          {navItems.length > 0 && (
            <>
              <div className="palette-section-title">Navigation</div>
              {navItems.map((item) => {
                const fi = filtered.indexOf(item);
                return (
                  <div key={item.id} onClick={() => execute(item)}
                    className={`palette-item ${fi === idx ? 'highlighted' : ''}`}>
                    <div className="palette-item-icon">
                      <i className={`fas ${item.icon}`} />
                    </div>
                    <div>
                      <div className="palette-item-title">Go to {item.label}</div>
                      <div className="palette-item-sub">Navigate to {item.id} section</div>
                    </div>
                    <span className="palette-item-shortcut">
                      ⌘{portfolio.nav.findIndex(n => n.id === item.id) + 1}
                    </span>
                  </div>
                );
              })}
            </>
          )}
          {otherItems.length > 0 && (
            <>
              <div className="palette-section-title">Actions & Themes</div>
              {otherItems.map((item) => {
                const fi = filtered.indexOf(item);
                return (
                  <div key={item.id} onClick={() => execute(item)}
                    className={`palette-item palette-item-small ${fi === idx ? 'highlighted' : ''}`}>
                    <div className="palette-item-icon">
                      <i className={`fas ${item.icon}`} style={{ color: item.color }} />
                    </div>
                    <span className="palette-item-title">{item.label}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
        <div className="palette-footer">
          <span><kbd className="kbd">↑↓</kbd> Navigate</span>
          <span><kbd className="kbd">↵</kbd> Select</span>
          <span><kbd className="kbd">esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}