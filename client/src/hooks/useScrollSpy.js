import { useEffect, useCallback } from 'react';

export function useScrollSpy(sectionIds, setActiveNav) {
  const handleScroll = useCallback(() => {
    let current = sectionIds[0];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 150) {
        current = id;
      }
    }
    setActiveNav(current);
  }, [sectionIds, setActiveNav]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}