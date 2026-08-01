import SectionHeader from '../ui/SectionHeader';
import GitHubWidget from '../interactive/GitHubWidget';
import portfolio from '../../data/portfolio';

export default function AboutSection() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeader number="01" icon="fa-circle-info" title="About"
          subtitle="Get to know more about my background, skills, and experience in software development." />

        <div className="about-grid">
          {/* Introduction */}
          <div className="liquid-glass about-card">
            <div className="about-card-header">
              <div className="about-card-icon blue">
                <i className="fas fa-user-astronaut" />
              </div>
              <div>
                <div className="about-card-label">~/introduction</div>
                <div className="about-card-sublabel">Who I am</div>
              </div>
            </div>
            <p className="about-text">
              <strong style={{ color: 'var(--color-text-primary)' }}>{portfolio.title}</strong> with{' '}
              <strong>{portfolio.years}+ years</strong> of experience building performant, scalable website.
              Linux enthusiast and open-source contributor passionate about{' '}
              <strong>clean architecture</strong> and terminal-based workflows.
            </p>
            <p className="about-text" style={{ marginBottom: '1.25rem' }}>
              Currently focused on <strong>Website</strong>. I believe in writing code that is not just
              functional, but elegant, maintainable, and well-documented.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {portfolio.skillTags.map(tag => (
                <span key={tag} className="about-tag">
                  <i className={`fab fa-${tag.toLowerCase()}`} style={{ marginRight: 4, opacity: 0.6 }} />{tag}
                </span>
              ))}
            </div>
            {portfolio.skills.map((skill, i) => (
              <div key={i} className="skill-bar">
                <div className="skill-bar-header">
                  <span className="skill-bar-name">
                    <i className={`fab ${skill.icon}`} style={{ marginRight: 4, opacity: 0.5 }} />{skill.name}
                  </span>
                  <span className="skill-bar-pct">
                    {skill.pct}{typeof skill.pct === 'number' ? '%' : ''}
                  </span>
                </div>
                <div className="skill-bar-track">
                  <div className="skill-bar-fill"
                    style={{ width: typeof skill.pct === 'number' ? `${skill.pct}%` : '20%' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Experience / Timeline */}
          <div className="liquid-glass about-card">
            <div className="about-card-header">
              <div className="about-card-icon purple">
                <i className="fas fa-briefcase" />
              </div>
              <div>
                <div className="about-card-label">~/experience</div>
                <div className="about-card-sublabel">My journey</div>
              </div>
            </div>
            {portfolio.timeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-date">
                  <i className="fas fa-calendar" style={{ marginRight: 4 }} />{item.date}
                </div>
                <div className="timeline-role">{item.role}</div>
                <div className="timeline-company">
                  <i className="fas fa-building" style={{ marginRight: 4 }} />{item.company}
                </div>
                {item.desc !== 'Not posted yet.' && (
                  <div className="timeline-desc">{item.desc}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <GitHubWidget />
      </div>
    </section>
  );
}