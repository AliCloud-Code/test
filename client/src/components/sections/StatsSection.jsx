import CountUp from '../ui/CountUp';
import portfolio from '../../data/portfolio';

export default function StatsSection() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {portfolio.stats.map((s, i) => (
            <div key={i} className="liquid-glass stat-card">
              <div className="stat-icon" style={{ color: s.color }}>
                <i className={`fas ${s.icon}`} />
              </div>
              <div className="stat-value" style={{ color: s.color }}>
                {typeof s.value === 'number' ? <CountUp target={s.value} active={true} /> : s.value}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-trend" style={{ color: s.color }}>
                <i className="fas fa-arrow-trend-up" style={{ marginRight: 4 }} />{s.trend}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}