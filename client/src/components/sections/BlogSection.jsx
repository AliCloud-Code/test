import SectionHeader from '../ui/SectionHeader';
import portfolio from '../../data/portfolio';

export default function BlogSection() {
  return (
    <section id="articles" className="section">
      <div className="container">
        <SectionHeader number="04" icon="fa-newspaper" title="Blog"
          subtitle="Thoughts, tutorials, and insights from my experience in software development." />

        <div className="articles-grid">
          {portfolio.articles.map((a, i) => (
            <div key={i} className="liquid-glass article-card">
              <div className="article-banner">
                <i className={`fab ${a.icon}`} />
                <span className="article-category">
                  <i className="fas fa-code" style={{ marginRight: 4 }} />{a.category}
                </span>
              </div>
              <div className="article-meta">
                <span><i className="fas fa-calendar" style={{ marginRight: 4 }} />Not posted yet</span>
                <span><i className="fas fa-clock" style={{ marginRight: 4 }} />Not posted yet</span>
              </div>
              <h3 className="article-title">{a.title}</h3>
              <p className="article-desc">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}