import { memo } from 'react';

const SectionHeader = memo(({ number, icon, title, subtitle }) => (
  <div className="section-header">
    <div className="section-label">
      <i className={`fas ${icon}`} /> {number}. {title}
    </div>
    <h2 className="section-title">
      <span style={{ color: 'var(--color-accent)', marginRight: 8 }}>
        <i className="fas fa-terminal" />
      </span>
      {title.toLowerCase().replace(/\s/g, '_')}
    </h2>
    <p className="section-subtitle">{subtitle}</p>
    <div className="section-divider" />
  </div>
));

export default SectionHeader;