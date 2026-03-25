import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;
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
      {/* Subtle gradient only — no image overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(224,128,64,0.07) 0%, transparent 60%)' }} />

      {/* Score gauge — shifts left when report appears */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute' }}
        animate={{ x: step >= 3 ? '-22vw' : '0vw', scale: step >= 3 ? 0.75 : 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ position: 'relative', width: '40vh', height: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.5, rotate: step >= 1 ? 0 : -180 }}
          transition={{ duration: 1.4, type: 'spring', bounce: 0.18 }}
        >
          <svg viewBox="0 0 240 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="120" cy="120" r={GAUGE_R} fill="none" stroke="rgba(234,217,190,0.08)" strokeWidth="10" />
            {/* Progress arc */}
            <motion.circle
              cx="120" cy="120" r={GAUGE_R}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: step >= 1 ? FILL_OFFSET : CIRCUMFERENCE }}
              transition={{ duration: 2.2, delay: 0.5, ease: 'circOut' }}
            />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14vh', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 0.95 }}>{SCORE}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '3vh', color: 'rgba(234,217,190,0.45)', marginTop: '0.5vh' }}>/ 100</span>
          </div>
        </motion.div>

        <motion.div
          style={{ marginTop: '4vh', padding: '1.4vh 4.5vh', borderRadius: '100px', background: 'var(--color-bg-muted)', border: '1px solid rgba(224,128,64,0.5)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
          transition={{ duration: 0.8, ease: 'circOut' }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '2.8vh', color: 'var(--color-text-primary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Moderately Prepared
          </span>
        </motion.div>
      </motion.div>

      {/* Right panel: report preview + callouts */}
      <motion.div
        style={{ position: 'absolute', right: '7vw', top: '50%', transform: 'translateY(-50%)', width: '42vw', display: 'flex', flexDirection: 'column', gap: '3.5vh' }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : 60 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '1.2vh', overflow: 'hidden', border: '1px solid rgba(234,217,190,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.55)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg-light) 0%, transparent 45%)', zIndex: 1 }} />
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
              style={{ fontFamily: 'var(--font-display)', fontSize: '4.5vh', fontWeight: 700, color: item.accent ? 'var(--color-primary)' : 'var(--color-text-primary)', letterSpacing: '-0.025em', margin: 0 }}
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
        Your overall resilience score — from 0 to 100 — is calculated across six weighted categories. An AI writes your personalized risk profile based on your exact answers.
      </div>
    </motion.div>
  );
}
