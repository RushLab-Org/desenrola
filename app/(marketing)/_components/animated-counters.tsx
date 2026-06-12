'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = { prefix?: string; value: number; suffix?: string; label: string };

const STATS: Stat[] = [
  { prefix: '+', value: 2400, label: 'respostas geradas' },
  { value: 12, label: 'técnicas de conversa' },
  { value: 7, label: 'dias de garantia total' },
];

function useCounter(target: number, running: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!running) return;
    const duration = 1400;
    const startTime = Date.now();
    function tick() {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [running, target]);
  return count;
}

function StatCounter({ stat }: { stat: Stat }) {
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCounter(stat.value, running);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRunning(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-counter">
      <p className="stat-counter__value">
        {stat.prefix}{count.toLocaleString('pt-BR')}{stat.suffix}
      </p>
      <p className="stat-counter__label">{stat.label}</p>
    </div>
  );
}

export function AnimatedCounters() {
  return (
    <div className="stats-row">
      {STATS.map((s) => <StatCounter key={s.label} stat={s} />)}
    </div>
  );
}
