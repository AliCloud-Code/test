import { memo } from 'react';
import portfolio from '../../data/portfolio';

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <i className="fas fa-terminal" style={{ color: 'var(--color-accent)' }} />
          ~/{portfolio.name}
        </div>
        <p className="footer-title">{portfolio.title}</p>
        <nav className="footer-nav">
          <ul className="footer-nav-list">
            {portfolio.nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="footer-nav-link">
                  <i className={`fas ${item.icon}`} />{item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-socials">
          {portfolio.footerSocials.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="footer-social-link">
              <i className={`fab ${s.icon}`} />
            </a>
          ))}
        </div>
        <div className="footer-tech">
          <span>Built with:</span>
          <i className="fab fa-html5" title="HTML5" />
          <i className="fab fa-css3-alt" title="CSS3" />
          <i className="fab fa-js" title="JavaScript" />
          <i className="fab fa-react" title="React" />
        </div>
        <p className="footer-copy">
          <i className="fas fa-copyright" /> 2026 ~/Ali · All rights reserved · Made with{' '}
          <i className="fas fa-heart" style={{ color: 'var(--color-error)' }} /> and lots of{' '}
          <i className="fas fa-mug-hot" style={{ color: '#FF9F0A' }} />
        </p>
        <p className="footer-easter">
          <i className="fas fa-gamepad" style={{ marginRight: 4 }} />↑ ↑ ↓ ↓ ← → ← → B A
        </p>
      </div>
    </footer>
  );
});

export default Footer;