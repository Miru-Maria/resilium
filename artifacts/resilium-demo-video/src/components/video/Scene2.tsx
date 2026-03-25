import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 3200),
      setTimeout(() => setStep(3), 6000),
      setTimeout(() => setStep(4), 10500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const labels = ['Financial', 'Health', 'Skills', 'Mobility', 'Psychological', 'Resources'];
  const weights = ['25%', '15%', '20%', '15%', '15%', '10%'];
  const angles = [0, 60, 120, 180, 240, 300];
  const scores = [0.54, 0.72, 0.65, 0.45, 0.70, 0.40];
  const SIZE = 260;
  const R = 110;

  function toXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: SIZE / 2 + r * Math.cos(rad), y: SIZE / 2 + r * Math.sin(rad) };
  }

  const outerPoints = angles.map(a => toXY(a, R));
  const dataPoints = angles.map((a, i) => toXY(a, R * scores[i]));
  const polygonData = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ background: 'var(--color-bg-light)' }}
      {...sceneTransitions.clipCircle}
    >
      {/* Top intro text */}
      <motion.p
        style={{ position: 'absolute', top: '10vh', fontFamily: 'var(--font-body)', fontSize: '3.4vh', color: 'var(--color-text-secondary)', textAlign: 'center', width: '70%', zIndex: 20 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'circOut' }}
      >
        An AI-powered personal resilience platform.
      </motion.p>

      {/* Center layout: radar + labels column */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', gap: '6vw' }}>

        {/* Radar chart */}
        <svg width={`${SIZE}px`} height={`${SIZE}px`} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible', flexShrink: 0 }}>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <motion.polygon
              key={i}
              points={angles.map(a => { const p = toXY(a, R * r); return `${p.x},${p.y}`; }).join(' ')}
              fill="none"
              stroke="rgba(234,217,190,0.1)"
              strokeWidth="1"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0 }}
              style={{ transformOrigin: `${SIZE / 2}px ${SIZE / 2}px` }}
              transition={{ duration: 1.2, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          {/* Spokes */}
          {outerPoints.map((p, i) => (
            <motion.line
              key={i}
              x1={SIZE / 2} y1={SIZE / 2} x2={p.x} y2={p.y}
              stroke="rgba(234,217,190,0.18)" strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: 'circOut' }}
            />
          ))}

          {/* Data polygon fill */}
          <motion.polygon
            points={polygonData}
            fill="rgba(224,128,64,0.15)"
            stroke="var(--color-primary)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
            style={{ transformOrigin: `${SIZE / 2}px ${SIZE / 2}px` }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
          />

          {/* Dot labels — directly on spoke endpoints */}
          {outerPoints.map((p, i) => {
            const labelR = R + 22;
            const lp = toXY(angles[i], labelR);
            return (
              <motion.text
                key={i}
                x={lp.x} y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(234,217,190,0.6)"
                fontSize="10"
                fontFamily="var(--font-body)"
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
              />
            );
          })}
        </svg>

        {/* Dimension cards column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4vh', minWidth: '30vw' }}>
          {labels.map((label, i) => (
            <motion.div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '2vh',
                padding: '1.5vh 2.4vh',
                borderRadius: '1vh',
                background: step >= 3 ? 'var(--color-bg-muted)' : 'transparent',
                border: step >= 3 ? '1px solid rgba(234,217,190,0.08)' : '1px solid transparent',
                transition: 'background 0.3s, border-color 0.3s',
              }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: step >= 2 ? 1 : 0, x: step >= 2 ? 0 : 40 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: 'circOut' }}
            >
              {/* Score bar */}
              <div style={{ flexShrink: 0, width: '5.5vh', height: '5.5vh', borderRadius: '50%', background: `conic-gradient(var(--color-primary) ${scores[i] * 360}deg, rgba(234,217,190,0.1) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '4vh', height: '4vh', borderRadius: '50%', background: 'var(--color-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4vh', color: 'var(--color-primary)', fontWeight: 700 }}>{Math.round(scores[i] * 100)}</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8vh', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: '0.3vh' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6vh', color: 'var(--color-primary)', opacity: 0.7 }}>{weights[i]}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <motion.h1
        style={{ position: 'absolute', bottom: '9vh', fontFamily: 'var(--font-display)', fontSize: '6vh', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em', zIndex: 20, textAlign: 'center' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 30 }}
        transition={{ duration: 1, ease: 'circOut' }}
      >
        360° holistic risk profiling.
      </motion.h1>

      <div className="subtitle-overlay">
        Resilium analyzes six key dimensions — Financial, Health, Skills, Mobility, Psychological resilience, and Resources — weighted to build your complete picture.
      </div>
    </motion.div>
  );
}
