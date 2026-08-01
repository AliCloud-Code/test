import { useRef, useEffect, useMemo } from 'react';

const ORBS = [
  { cls: 'bg-orb-1', w: 600, h: 600, top: '-200px', left: '-200px', bg: 'var(--color-accent)', delay: '0s' },
  { cls: 'bg-orb-2', w: 500, h: 500, top: '30%', right: '-150px', bg: 'var(--color-purple)', delay: '-8s' },
  { cls: 'bg-orb-3', w: 450, h: 450, bottom: '-100px', left: '30%', bg: 'var(--color-success)', delay: '-16s' },
  { cls: 'bg-orb-4', w: 400, h: 400, top: '60%', left: '-100px', bg: '#FF9F0A', delay: '-12s' },
];

// Keep particle canvas as a controlled component via ref
let particlesInstance = null;

export const initParticles = (canvas) => {
  if (!canvas || particlesInstance) return particlesInstance;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = 0, mouseY = 0, raf;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 40000), 40);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  };

  const onMouse = (e) => { mouseX = e.clientX; mouseY = e.clientY; };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      const dx = mouseX - p.x, dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const f = (120 - dist) / 120;
        p.vx -= (dx / dist) * f * 0.008;
        p.vy -= (dy / dist) * f * 0.008;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    }
    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - d / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(animate);
  };

  resize();
  animate();
  document.addEventListener('mousemove', onMouse, { passive: true });
  window.addEventListener('resize', () => {
    const debounced = setTimeout(() => { resize(); }, 200);
    return () => clearTimeout(debounced);
  });

  particlesInstance = {
    destroy: () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMouse);
      particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  return particlesInstance;
};

export const initMatrixRain = (canvas) => {
  if (!canvas) return { start: () => {}, stop: () => {} };
  const ctx = canvas.getContext('2d');
  const fontSize = 14;
  let columns = [];
  let animating = false;
  let raf;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789';

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Array(Math.floor(canvas.width / fontSize)).fill(0).map(() => Math.random() * canvas.height);
  };

  const animate = () => {
    if (!animating) return;
    ctx.fillStyle = 'rgba(0, 8, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;
    columns.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.98 ? '#fff' : '#0f0';
      ctx.fillText(char, i * fontSize, y);
      if (y > canvas.height && Math.random() > 0.975) columns[i] = 0;
      columns[i] += fontSize;
    });
    raf = requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener('resize', resize);

  return {
    start: () => {
      animating = true;
      canvas.style.opacity = '0.35';
      canvas.style.transition = 'opacity 0.8s';
      animate();
    },
    stop: () => {
      animating = false;
      cancelAnimationFrame(raf);
      canvas.style.opacity = '0';
      setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 800);
    },
  };
};

export default function Background() {
  const particleRef = useRef(null);
  const matrixRef = useRef(null);
  const isMobile = useMemo(() => window.matchMedia('(max-width: 768px)').matches, []);

  useEffect(() => {
    if (isMobile) return;
    const instance = initParticles(particleRef.current);
    return () => { if (instance) instance.destroy(); };
  }, [isMobile]);

  // Expose matrix controller to window for theme hook
  useEffect(() => {
    const controller = initMatrixRain(matrixRef.current);
    window.__matrixController = controller;
    return () => controller.stop();
  }, []);

  return (
    <div className="bg-layer" aria-hidden="true">
      {ORBS.map((o) => (
        <div
          key={o.cls}
          className={`bg-orb ${o.cls}`}
          style={{
            width: o.w, height: o.h,
            top: o.top, right: o.right, bottom: o.bottom, left: o.left,
            background: `radial-gradient(circle, ${o.bg}, transparent 70%)`,
            animationDelay: o.delay,
            position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.35,
          }}
        />
      ))}
      <div className="bg-grid" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)',
      }} />
      {!isMobile && <canvas ref={particleRef} className="bg-particles" style={{ position: 'absolute', inset: 0 }} />}
      <canvas ref={matrixRef} className="matrix-rain" style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }} />
      <div className="bg-noise" style={{
        position: 'absolute', inset: 0, opacity: 0.02,
        background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      }} />
      <style>{`
        @keyframes orbFloat {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(80px,-40px) scale(1.08)}
          66%{transform:translate(-60px,60px) scale(0.92)}
        }
        .bg-orb { animation: orbFloat 25s ease-in-out infinite; will-change: transform; }
        .bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: -1; overflow: hidden; }
      `}</style>
    </div>
  );
}