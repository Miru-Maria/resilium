import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;

// Fixed-pixel gauge: radius 100px in a 240x240 viewBox → circumference = 2π×100 ≈ 628
const GAUGE_R = 100;
const CIRCUMFERENCE = 2 * Math.PI * GAUGE_R;
const SCORE = 54;
const FILL_OFFSET = CIRCUMFERENCE * (1 - SCORE / 100);

export function Scene4() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2800),
      setTimeout(() => setStep(3), 5500),
      setTimeout(() => setStep(4), 8000),
      setTimeout(() => setStep(5), 10000),
      setTimeout(() => setStep(6), 12000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ background: 'var(--color-bg-light)' }}
      {...sceneTransitions.splitHorizontal}
    >
      <img
        src={`${BASE}images/data-orb.png`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, mixBlendMode: 'screen', pointerEvents: 'none' }}
        alt=""
      />

      {/* Score gauge — left side */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute' }}
        animate={{ x: step >= 3 ? '-24vw' : '0vw', scale: step >= 3 ? 0.72 : 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ position: 'relative', width: '38vh', height: '38vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.5, rotate: step >= 1 ? 0 : -90 }}
          transition={{ duration: 1.4, type: 'spring', bounce: 0.2 }}
        >
          <svg
            viewBox="0 0 240 240"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
          >
            {/* Track */}
            <circle cx="120" cy="120" r={GAUGE_R} fill="none" stroke="var(--color-bg-muted)" strokeWidth="8" />
            {/* Progress */}
            <motion.circle
              cx="120" cy="120" r={GAUGE_R}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: step >= 1 ? FILL_OFFSET : CIRCUMFERENCE }}
              transition={{ duration: 2.2, delay: 0.4, ease: 'circOut' }}
            />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13vh', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{SCORE}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8vh', color: 'var(--color-text-muted)' }}>/ 100</span>
          </div>
        </motion.div>

        {/* Score label badge */}
        <motion.div
          style={{ marginTop: '3.5vh', padding: '1.2vh 4vh', borderRadius: '100px', background: 'var(--color-bg-muted)', border: '1px solid var(--color-primary)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
          transition={{ duration: 0.8, ease: 'circOut' }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '2.5vh', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Moderately Prepared
          </span>
        </motion.div>
      </motion.div>

      {/* Right side — report preview + callouts */}
      <motion.div
        style={{ position: 'absolute', right: '8vw', top: '50%', transform: 'translateY(-50%)', width: '40vw', display: 'flex', flexDirection: 'column', gap: '4vh' }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : 60 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '1.2vh', overflow: 'hidden', border: '1px solid rgba(234,217,190,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg-light) 0%, transparent 40%)', zIndex: 1 }} />
          <img src={`${BASE}images/resilium-thumbnail.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Resilium Report" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
          {[
            { text: 'Six weighted categories.', show: step >= 4 },
            { text: 'AI-written risk profile.', show: step >= 5 },
            { text: 'Personalized to you.', show: step >= 6, accent: true },
          ].map((item, i) => (
            <motion.h3
              key={i}
              style={{ fontFamily: 'var(--font-display)', fontSize: '4vh', fontWeight: 700, color: item.accent ? 'var(--color-primary)' : 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: item.show ? 1 : 0, x: item.show ? 0 : 25 }}
              transition={{ duration: 0.7, ease: 'circOut' }}
            >
              {item.text}
            </motion.h3>
          ))}
        </div>
      </motion.div>

      <div className="subtitle-overlay">
        Your overall resilience score is calculated across six weighted categories, followed by an AI-written risk profile that interprets your unique situation.
      </div>
    </motion.div>
  );
}
