import { useEffect } from 'react';

export function useSpecularTracking() {
  useEffect(() => {
    const onMove = (e) => {
      document.querySelectorAll('.liquid-glass').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        el.style.setProperty('--specular-x', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--specular-y', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, []);
}