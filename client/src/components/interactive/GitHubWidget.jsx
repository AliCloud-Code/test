import { useState, useEffect, useMemo } from 'react';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Go: '#00ADD8', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

export default function GitHubWidget() {
  const [data, setData] = useState(null);

  const heatmap = useMemo(() =>
    Array.from({ length: 364 }, () => {
      const r = Math.random();
      return r > 0.97 ? 4 : r > 0.93 ? 3 : r > 0.85 ? 2 : r > 0.7 ? 1 : 0;
    }), []);

  useEffect(() => {
    fetch('https://api.github.com/users/AliCloud-Code')
      .then(r => r.json())
      .then(user => {
        fetch('https://api.github.com/users/AliCloud-Code/repos?per_page=100&sort=updated')
          .then(r => r.json())
          .then(repos => {
            setData({ user, repos: repos.slice(0, 5), stars: repos.reduce((s, r) => s + r.stargazers_count, 0) });
          });
      })
      .catch(() => setData({ fallback: true }));
  }, []);

  const getLangColor = (lang) => LANG_COLORS[lang] || '#858585';

  const stats = [
    { icon: 'fa-book', label: 'Repositories', val: data?.user?.public_repos ?? '--' },
    { icon: 'fa-users', label: 'Followers', val: data?.user?.followers ?? '--' },
    { icon: 'fa-star', label: 'Total Stars', val: data?.stars ?? '--' },
  ];

  const heatColors = [
    'rgba(255,255,255,0.04)',
    'rgba(0,200,100,0.25)',
    'rgba(0,200,100,0.45)',
    'rgba(0,200,100,0.65)',
    'rgba(0,200,100,0.85)',
  ];

  return (
    <div className="liquid-glass github-widget">
      <div className="github-header">
        <div className="github-avatar">
          <i className="fab fa-github" />
        </div>
        <div>
          <div className="github-name">
            <i className="fas fa-circle-check" style={{ color: 'var(--color-success)', marginRight: 6 }} />
            GitHub Activity
          </div>
          <div className="github-sub">
            {data?.user ? `@${data.user.login} · Active contributor` : 'Loading live data...'}
          </div>
        </div>
      </div>

      <div className="github-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="github-stat">
            <i className={`fas ${s.icon} github-stat-icon`} />
            <div className="github-stat-val">{s.val}</div>
            <div className="github-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div className="github-section-title">
          <i className="fas fa-chart-line" style={{ marginRight: 6, color: 'var(--color-success)' }} />
          Contribution Activity
        </div>
        <div className="github-heatmap">
          {heatmap.map((lvl, i) => (
            <div key={i} className="github-heat-cell" style={{ background: heatColors[lvl] }} title={`Level ${lvl}`} />
          ))}
        </div>
      </div>

      {data?.repos && data.repos.length > 0 && (
        <div>
          <div className="github-section-title">
            <i className="fas fa-fire" style={{ marginRight: 6, color: '#FF9F0A' }} />
            Top Repositories
          </div>
          <div className="github-repo-list">
            {data.repos.map(r => (
              <a key={r.name} href={r.html_url} target="_blank" rel="noopener" className="github-repo">
                <div className="github-repo-info">
                  <i className="fas fa-book" style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }} />
                  <span className="github-repo-name">{r.name}</span>
                  {r.language && (
                    <span className="github-repo-lang">
                      <span className="github-repo-lang-dot" style={{ background: getLangColor(r.language) }} />
                      {r.language}
                    </span>
                  )}
                </div>
                <div className="github-repo-stats">
                  <span><i className="fas fa-star" style={{ marginRight: 2 }} /> {r.stargazers_count}</span>
                  <span><i className="fas fa-code-fork" style={{ marginRight: 2 }} /> {r.forks_count}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}