import { useEffect } from 'react';
import { useToast } from '../components/ui/Toast';

export function useKonamiCode() {
  const addToast = useToast();

  useEffect(() => {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
    let idx = 0;
    const handler = (e) => {
      if (e.code === seq[idx]) {
        idx++;
        if (idx === seq.length) {
          addToast('You found the secret! Konami Code activated!', 'success', 'Easter Egg!');
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [addToast]);
}