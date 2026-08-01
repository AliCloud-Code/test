import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader';

const FILTERS = [
  { id: 'all', icon: 'fa-layer-group', label: 'All' },
  { id: 'web', icon: 'fa-globe', label: 'Web Apps' },
  { id: 'tool', icon: 'fa-wrench', label: 'Tools' },
  { id: 'oss', icon: 'fa-github', label: 'Open Source' },
];

export default function ProjectsSection() {
  const [filter, setFilter] = useState('all');

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeader number="03" icon="fa-code" title="Projects"
          subtitle="A selection of projects I've worked on. (Not currently posted.)" />

        <div className="project-filters">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`filter-btn ${filter === f.id ? 'active-f' : ''}`}>
              <i className={`fas ${f.icon}`} style={{ marginRight: 4 }} />{f.label}
            </button>
          ))}
        </div>

        <div className="liquid-glass project-empty">
          <div className="project-empty-icon">
            <i className="fas fa-cloud" />
          </div>
          <h3 className="project-empty-title">Not currently posted</h3>
          <p className="project-empty-desc">
            Projects will be added here soon. Check back later for updates.
          </p>
        </div>
      </div>
    </section>
  );
}