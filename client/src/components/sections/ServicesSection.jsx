import SectionHeader from '../ui/SectionHeader';
import portfolio from '../../data/portfolio';

export default function ServicesSection() {
  return (
    <section id="services" className="section">
      <div className="container">
        <SectionHeader number="02" icon="fa-briefcase" title="Services"
          subtitle="Professional services I offer to help bring your projects to life." />

        <div className="services-grid">
          {portfolio.services.map((s, i) => (
            <div key={i} className="liquid-glass service-card">
              <div className="service-icon"
                style={{ background: s.color + '1a', borderColor: s.color + '33', color: s.color }}>
                <i className={`fas ${s.icon}`} />
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}