import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;

export function Scene5() {
  const [step, setStep] = useState(0);

  const items = [
    'Build a 3-month emergency fund',
    'Prepare a 72-hour go-bag',
    'Identify secondary income streams',
    'Learn basic first aid',
    'Review local evacuation routes',
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setStep(1), 800),
    ];
    items.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(2 + i), 2000 + i * 1600));
    });
    timers.push(setTimeout(() => setStep(10), 11500));
    timers.push(setTimeout(() => setStep(11), 13500));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ background: 'var(--color-bg-light)' }}
      {...sceneTransitions.perspectiveFlip}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, var(--color-bg-muted) 0%, var(--color-bg-light) 60%)', opacity: 0.6 }} />

      <div style={{ position: 'relative', zIndex: 20, width: '58vw', display: 'flex', flexDirection: 'column', gap: '2vh' }}>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh', marginBottom: '6vh' }}>
          {items.map((item, i) => {
            const isChecked = step >= 2 + i;
            return (
              <motion.div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '3vh',
                  padding: '2.2vh 3vh', borderRadius: '1.2vh',
                  background: isChecked ? 'rgba(224,128,64,0.08)' : 'var(--color-bg-muted)',
                  border: isChecked ? '1px solid rgba(224,128,64,0.4)' : '1px solid transparent',
                  transition: 'background 0.4s, border-color 0.4s',
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -50 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '3.5vh', height: '3.5vh', borderRadius: '0.6vh', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isChecked ? 'var(--color-primary)' : 'transparent',
                  border: isChecked ? '2px solid var(--color-primary)' : '2px solid rgba(234,217,190,0.3)',
                  transition: 'background 0.3s, border-color 0.3s',
                }}>
                  <motion.svg
                    viewBox="0 0 24 24" fill="none"
                    style={{ width: '2.2vh', height: '2.2vh' }}
                    initial={false}
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      stroke="var(--color-bg-light)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '2.8vh',
                  color: isChecked ? 'rgba(234,217,190,0.55)' : 'var(--color-text-primary)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  transition: 'color 0.3s',
                }}>
                  {item}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar + milestone */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 10 ? 1 : 0, y: step >= 10 ? 0 : 30 }}
          transition={{ duration: 1 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vh' }}>
              <img src={`${BASE}images/shield-icon.png`} alt="Shield" style={{ width: '4.5vh', height: '4.5vh', objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.8vh', fontWeight: 700, color: 'var(--color-primary)' }}>
                Well Prepared
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2vh', color: 'var(--color-text-muted)' }}>Level 3 / 4</span>
          </div>
          <div style={{ width: '100%', height: '1.2vh', background: 'var(--color-bg-muted)', borderRadius: '100px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'var(--color-primary)', borderRadius: '100px' }}
              initial={{ width: '40%' }}
              animate={{ width: step >= 10 ? '75%' : '40%' }}
              transition={{ duration: 2.2, ease: 'circOut' }}
            />
          </div>
        </motion.div>

        {/* Time horizon text */}
        <motion.div
          style={{ marginTop: '6vh', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: step >= 11 ? 1 : 0, scale: step >= 11 ? 1 : 0.9 }}
          transition={{ duration: 1, type: 'spring' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '5vh', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
            A prioritized action plan —<br />
            <span style={{ color: 'var(--color-primary)' }}>30 days, 90 days, 12 months.</span>
          </h2>
        </motion.div>
      </div>

      <div className="subtitle-overlay">
        The Action Checklist is sorted by your weakest areas first. The Strategic Action Plan lays out concrete steps over three time horizons — 30 days, 90 days, and 12 months.
      </div>
    </motion.div>
  );
}
