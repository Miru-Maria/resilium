import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;

export function Scene2() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3500),
      setTimeout(() => setStep(3), 6500),
      setTimeout(() => setStep(4), 11000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const labels = ['Financial', 'Health', 'Skills', 'Mobility', 'Psychological', 'Resources'];
  const angles = [0, 60, 120, 180, 240, 300];
  // Sample scores for the filled polygon
  const scores = [0.54, 0.72, 0.65, 0.45, 0.70, 0.40];
  const SIZE = 240; // px, half = 120
  const R = 110;

  function toXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: SIZE / 2 + r * Math.cos(rad), y: SIZE / 2 + r * Math.sin(rad) };
  }

  const outerPoints = angles.map(a => toXY(a, R));
  const dataPoints = angles.map((a, i) => toXY(a, R * scores[i]));
  const polygonOuter = outerPoints.map(p => `${p.x},${p.y}`).join(' ');
  const polygonData = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ background: 'var(--color-bg-light)' }}
      {...sceneTransitions.clipCircle}
    >
      <video
        src={`${BASE}videos/bg-network.mp4`}
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, mixBlendMode: 'screen', pointerEvents: 'none' }}
      />

      {/* Top text */}
      <motion.p
        style={{ position: 'absolute', top: '12vh', fontFamily: 'var(--font-body)', fontSize: '3.2vh', color: 'var(--color-text-secondary)', textAlign: 'center', width: '70%', zIndex: 20 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'circOut' }}
      >
        Resilium is an AI-powered personal resilience platform.
      </motion.p>

      {/* Radar chart */}
      <div style={{ position: 'relative', zIndex: 20, marginTop: '4vh' }}>
        <svg width={`${SIZE}px`} height={`${SIZE}px`} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <motion.polygon
              key={i}
              points={angles.map(a => { const p = toXY(a, R * r); return `${p.x},${p.y}`; }).join(' ')}
              fill="none"
              stroke="rgba(234,217,190,0.12)"
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
              stroke="rgba(234,217,190,0.2)" strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: step >= 2 ? 1 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: 'circOut' }}
            />
          ))}

          {/* Data polygon fill */}
          <motion.polygon
            points={polygonData}
            fill="rgba(224,128,64,0.18)"
            stroke="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
            style={{ transformOrigin: `${SIZE / 2}px ${SIZE / 2}px` }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
          />
          {/* Data polygon border */}
          <motion.polygon
            points={polygonData}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
            style={{ transformOrigin: `${SIZE / 2}px ${SIZE / 2}px` }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
          />

          {/* Labels */}
          {outerPoints.map((p, i) => {
            const labelR = R + 24;
            const lp = toXY(angles[i], labelR);
            return (
              <motion.text
                key={i}
                x={lp.x} y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(234,217,190,0.7)"
                fontSize="11"
                fontFamily="var(--font-body)"
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
              >
                {labels[i]}
              </motion.text>
            );
          })}
        </svg>
      </div>

      {/* 360° tagline */}
      <motion.h1
        style={{ position: 'absolute', bottom: '18vh', fontFamily: 'var(--font-display)', fontSize: '6.5vh', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em', zIndex: 20 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 30 }}
        transition={{ duration: 1, ease: 'circOut' }}
      >
        360° holistic risk profiling.
      </motion.h1>

      <div className="subtitle-overlay">
        Resilium analyzes six key dimensions of your life — financial stability, health, skills, mobility, psychological resilience, and resources — to build a complete picture.
      </div>
    </motion.div>
  );
}
