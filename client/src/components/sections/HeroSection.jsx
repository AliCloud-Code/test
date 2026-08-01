import Terminal from '../interactive/Terminal';
import portfolio from '../../data/portfolio';

export default function HeroSection() {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-inner">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <i className="fas fa-circle-check" style={{ marginRight: 4 }} />
          {portfolio.hero.badge}
        </div>

        <h1 className="hero-title">
          <span className="hero-greeting">{portfolio.hero.greeting}</span>
          <span className="hero-name">{portfolio.name}</span>
          <span className="hero-sub">
            I build <span style={{ color: 'var(--color-accent)' }}>Website</span> things.
          </span>
        </h1>

        <p className="hero-desc">
          <strong style={{ color: 'var(--color-accent)' }}>{portfolio.hero.role}</strong>
          {' '}{portfolio.hero.tagline}
        </p>

        <Terminal />

        <div className="hero-actions">
          <a href="#about" className="btn btn-primary btn-lg">
            <i className="fas fa-user" />whoami
          </a>
          <a href="#projects" className="btn btn-lg">
            <i className="fas fa-code" />projects
          </a>
          <a href="#contact" className="btn btn-lg">
            <i className="fas fa-envelope" />contact
          </a>
        </div>
      </div>
    </section>
  );
}