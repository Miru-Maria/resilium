import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;

export function Scene3() {
  const [step, setStep] = useState(-1);

  const steps = [
    { title: 'Mental Resilience', detail: '10 questions · 1–5 scale' },
    { title: 'Location', detail: 'London, UK' },
    { title: 'Income Stability', detail: 'Freelance / Variable' },
    { title: 'Financial Buffer', detail: '3 months savings' },
    { title: 'Skills', detail: 'Digital/Tech · First Aid' },
    { title: 'Health & Mobility', detail: 'Good health · Fully mobile' },
    { title: 'Housing', detail: 'Renting long-term' },
    { title: 'Risk Concerns', detail: 'Job Loss · Hyperinflation' },
  ];

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setStep(i), 800 + i * 2200)
    );
    timers.push(setTimeout(() => setStep(steps.length), 800 + steps.length * 2200 + 800));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10 overflow-hidden"
      style={{ background: 'var(--color-bg-light)' }}
      {...sceneTransitions.morphExpand}
    >
      <img
        src={`${BASE}images/risk-map.png`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.12, pointerEvents: 'none' }}
        alt=""
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--color-bg-light) 0%, transparent 30%, transparent 70%, var(--color-bg-light) 100%)', opacity: 0.85 }} />

      {/* Step counter running in top-right */}
      <motion.div
        style={{ position: 'absolute', top: '8vh', right: '8vw', zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: '1.8vh', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
        animate={{ opacity: step >= 0 && step < steps.length ? 1 : 0 }}
      >
        {step >= 0 && step < steps.length ? `${step + 1} / ${steps.length}` : ''}
      </motion.div>

      {/* Kinetic stack */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: '12vw', zIndex: 20 }}>
        {steps.map((s, i) => {
          const isActive = step === i;
          const isPast = step > i;
          return (
            <motion.div
              key={i}
              style={{ position: 'absolute' }}
              initial={{ opacity: 0, y: '50vh', scale: 0.9, filter: 'blur(8px)' }}
              animate={{
                opacity: isActive ? 1 : isPast ? 0 : 0,
                y: isActive ? '0vh' : isPast ? '-55vh' : '50vh',
                scale: isActive ? 1 : isPast ? 1.08 : 0.9,
                filter: isActive ? 'blur(0px)' : 'blur(8px)',
              }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8vh', color: 'var(--color-primary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.2vh' }}>
                Step {i + 1}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '9vh', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '2.5vh' }}>
                {s.title}
              </h2>
              <div style={{ display: 'inline-block', background: 'var(--color-bg-muted)', border: '1px solid rgba(224,128,64,0.3)', borderRadius: '100px', padding: '1vh 3vh' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '3vh', color: 'var(--color-text-secondary)' }}>{s.detail}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Final reveal */}
        <motion.div
          style={{ position: 'absolute', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 12vw' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: step === steps.length ? 1 : 0, scale: step === steps.length ? 1 : 0.6 }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.25 }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '11vh', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            Ten dimensions.
          </h1>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '11vh', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
            Ten minutes.
          </h1>
        </motion.div>
      </div>

      <div className="subtitle-overlay">
        The assessment takes about ten minutes and covers dimensions from mental resilience to financial buffer, location risk, and specific life concerns.
      </div>
    </motion.div>
  );
}
