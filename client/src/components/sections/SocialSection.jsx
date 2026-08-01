import SectionHeader from '../ui/SectionHeader';
import portfolio from '../../data/portfolio';

export default function SocialSection() {
  return (
    <section id="social" className="section">
      <div className="container">
        <SectionHeader number="05" icon="fa-share-nodes" title="Connect"
          subtitle="Find me on various platforms. Let's connect and collaborate!" />

        <div className="social-grid">
          {portfolio.socials.map((s, i) => (
            <a key={i} href={s.url}
              target={s.url.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="liquid-glass social-card">
              <div className="social-icon-circle"
                style={{ background: s.color + '1a', borderColor: s.color + '33', color: s.color }}>
                <i className={`fab ${s.icon}`} />
              </div>
              <span className="social-label">{s.label}</span>
              <span className="social-handle">{s.handle}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}