import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader';
import { useToast } from '../ui/Toast';
import portfolio from '../../data/portfolio';
import { sounds } from '../../utils/sound';

export default function ContactSection() {
  const addToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const subject = f.subject.value;
    const message = f.message.value.trim();

    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('visible'));

    let valid = true;
    if (!name || name.length < 2) { document.getElementById('nameError')?.classList.add('visible'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('emailError')?.classList.add('visible'); valid = false; }
    if (!message || message.length < 10) { document.getElementById('messageError')?.classList.add('visible'); valid = false; }
    if (!valid) { try { sounds.error(); } catch {} return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (data.success) {
        addToast("Message sent successfully! I'll get back to you within 24 hours.", 'success', 'Message Sent');
        f.reset();
        setSent(true);
        setTimeout(() => setSent(false), 6000);
        try { sounds.success(); } catch {}
      } else {
        addToast(data.error || 'Failed to send message.', 'error');
        try { sounds.error(); } catch {}
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
      try { sounds.error(); } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionHeader number="06" icon="fa-envelope" title="Contact"
          subtitle="Have a project in mind? Let's discuss how we can work together." />

        <div className="contact-grid">
          {/* Contact Methods */}
          <div className="contact-methods">
            {portfolio.contactMethods.map((m, i) => {
              const W = m.url ? 'a' : 'div';
              return (
                <W key={i}
                  href={m.url || undefined}
                  target={m.url?.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={`liquid-glass contact-method ${!m.url ? 'no-link' : ''}`}>
                  <div className="contact-method-icon">
                    <i className={`fas ${m.icon}`} />
                  </div>
                  <div>
                    <div className="contact-method-title">{m.title}</div>
                    <div className="contact-method-detail">{m.detail}</div>
                  </div>
                </W>
              );
            })}
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="liquid-glass contact-form">
            {sent && (
              <div className="contact-success">
                <i className="fas fa-circle-check" />
                Message sent successfully! I'll get back to you within 24 hours.
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user" style={{ marginRight: 4 }} />your_name
                </label>
                <input name="name" required className="form-input" placeholder="John Doe"
                  autoComplete="name"
                  onFocus={() => document.getElementById('nameError')?.classList.remove('visible')} />
                <div id="nameError" className="form-error">
                  <i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />
                  Name is required (min 2 characters)
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-at" style={{ marginRight: 4 }} />email_address
                </label>
                <input name="email" type="email" required className="form-input" placeholder="john@example.com"
                  autoComplete="email"
                  onFocus={() => document.getElementById('emailError')?.classList.remove('visible')} />
                <div id="emailError" className="form-error">
                  <i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />
                  Valid email required
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-tag" style={{ marginRight: 4 }} />subject
              </label>
              <select name="subject" className="form-select">
                <option value="">Select a topic...</option>
                <option value="project">Project Inquiry</option>
                <option value="consulting">Consulting</option>
                <option value="collaboration">Collaboration</option>
                <option value="job">Job Opportunity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-message" style={{ marginRight: 4 }} />message
              </label>
              <textarea name="message" required rows={5} className="form-textarea"
                placeholder="Tell me about your project..."
                onFocus={() => document.getElementById('messageError')?.classList.remove('visible')} />
              <div id="messageError" className="form-error">
                <i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />
                Message cannot be empty (min 10 characters)
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg form-submit" disabled={submitting}>
              {submitting ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> send_message</>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}