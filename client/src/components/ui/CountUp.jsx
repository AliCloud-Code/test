import { useState, useEffect } from 'react';

export default function CountUp({ target, active }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active || target <= 0 || typeof target !== 'number') return;
    const start = performance.now();
    let raf;
    const animate = (now) => {
      const p = Math.min((now - start) / 2200, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return <>{val}+</>;
}