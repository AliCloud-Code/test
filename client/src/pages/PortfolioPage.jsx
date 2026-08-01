import { useState, useCallback, useEffect } from 'react';
import Background from '../components/effects/Background';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import BlogSection from '../components/sections/BlogSection';
import SocialSection from '../components/sections/SocialSection';
import ContactSection from '../components/sections/ContactSection';
import CommandPalette from '../components/interactive/CommandPalette';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useSpecularTracking } from '../hooks/useSpecularTracking';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { toggleSound } from '../utils/sound';
import portfolio from '../data/portfolio';

const THEMES = [
  ['default', '#007AFF'], ['cyber', '#0ff'], ['sunset', '#ff6b35'],
  ['purple', '#a855f7'], ['ocean', '#0ea5e9'], ['matrix', '#0f0'],
];

export default function PortfolioPage() {
  const [activeNav, setActiveNav] = useState('home');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem('portfolio-theme') || 'default'; }
    catch { return 'default'; }
  });

  const scrollProgress = useScrollProgress();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useSpecularTracking();
  useKonamiCode();
  useScrollSpy(portfolio.nav.map(n => n.id), setActiveNav);

  useEffect(() => {
    const upd = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', upd, { passive: true });
    return () => window.removeEventListener('scroll', upd);
  }, []);

  const setTheme = useCallback((th) => {
    setThemeState(th);
    try { localStorage.setItem('portfolio-theme', th); } catch {}
    if (th === 'default') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', th);
  }, []);

  useEffect(() => {
    if (theme !== 'default') document.documentElement.setAttribute('data-theme', theme);
    window.__setTheme = setTheme;
    return () => { delete window.__setTheme; };
  }, [theme, setTheme]);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowPalette(p => !p); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const toggleSoundFn = useCallback(() => setSoundEnabled(toggleSound()), []);

  return (
    <div>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Background />

      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <Header
        activeNav={activeNav}
        onTogglePalette={() => setShowPalette(true)}
        onToggleSound={toggleSoundFn}
        soundEnabled={soundEnabled}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(m => !m)}
      />

      <CommandPalette show={showPalette} onClose={() => setShowPalette(false)} theme={theme} setTheme={setTheme} toggleSoundFn={toggleSoundFn} />

      <div className="floating-theme">
        <button onClick={() => setShowThemeDropdown(d => !d)} className="floating-theme-btn" title="Switch theme">
          <i className="fas fa-palette" />
        </button>
        {showThemeDropdown && (
          <div className="floating-theme-dropdown" style={{ display: 'block' }}>
            {THEMES.map(([t, c]) => (
              <button key={t} onClick={() => setTheme(t)} className={`floating-theme-option ${theme === t ? 'selected' : ''}`}>
                <i className="fas fa-circle floating-theme-dot" style={{ color: c }} />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`back-to-top ${showBackToTop ? '' : 'hidden'}`}>
        <i className="fas fa-arrow-up" />
      </button>

      <main id="main-content">
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <BlogSection />
        <SocialSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}