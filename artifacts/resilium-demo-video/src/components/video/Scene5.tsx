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
      {/* Subtle top glow only */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(224,128,64,0.07) 0%, transparent 55%)' }} />

      {/* Two-column layout: checklist left, time horizons right */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', gap: '8vw', alignItems: 'center', width: '82vw' }}>

        {/* Left: Checklist */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.6vh' }}>
          <motion.p
            style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8vh', color: 'var(--color-primary)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.5vh' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 1 ? 1 : 0 }}
          >
            Action Checklist
          </motion.p>

          {items.map((item, i) => {
            const isChecked = step >= 2 + i;
            return (
              <motion.div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '2.5vh',
                  padding: '2vh 2.8vh', borderRadius: '1.2vh',
                  background: isChecked ? 'rgba(224,128,64,0.08)' : 'var(--color-bg-muted)',
                  border: `1px solid ${isChecked ? 'rgba(224,128,64,0.35)' : 'rgba(234,217,190,0.06)'}`,
                  transition: 'background 0.4s, border-color 0.4s',
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -50 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div style={{
                  width: '3.5vh', height: '3.5vh', borderRadius: '0.6vh', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isChecked ? 'var(--color-primary)' : 'transparent',
                  border: isChecked ? '2px solid var(--color-primary)' : '2px solid rgba(234,217,190,0.25)',
                  transition: 'background 0.3s, border-color 0.3s',
                }}>
                  <motion.svg viewBox="0 0 24 24" fill="none" style={{ width: '2.2vh', height: '2.2vh' }}>
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
                  fontFamily: 'var(--font-body)', fontSize: '2.6vh',
                  color: isChecked ? 'rgba(234,217,190,0.45)' : 'var(--color-text-primary)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  transition: 'color 0.3s',
                }}>
                  {item}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Progress + time horizons */}
        <motion.div
          style={{ flex: '0 0 28vw', display: 'flex', flexDirection: 'column', gap: '5vh' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: step >= 10 ? 1 : 0, x: step >= 10 ? 0 : 50 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Resilience tier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2vh', marginBottom: '-1vh' }}>
            <img src={`${BASE}images/shield-icon.png`} alt="" style={{ width: '5.5vh', height: '5.5vh', objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6vh', color: 'rgba(234,217,190,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3vh' }}>Level 3 / 4</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4.5vh', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>Well Prepared</div>
            </div>
          </div>
          <div style={{ width: '100%', height: '1.2vh', background: 'var(--color-bg-muted)', borderRadius: '100px', overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(to right, var(--color-primary), rgba(224,128,64,0.7))', borderRadius: '100px' }}
              initial={{ width: '40%' }}
              animate={{ width: step >= 10 ? '75%' : '40%' }}
              transition={{ duration: 2.2, ease: 'circOut' }}
            />
          </div>

          {/* Time horizon blocks */}
          {[
            { label: '30 days', desc: 'Quick wins & urgent gaps' },
            { label: '90 days', desc: 'Core resilience building' },
            { label: '12 months', desc: 'Long-term strategy' },
          ].map((h, i) => (
            <motion.div
              key={i}
              style={{ padding: '2.5vh 3vh', borderRadius: '1.2vh', background: 'var(--color-bg-muted)', border: '1px solid rgba(234,217,190,0.08)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 11 ? 1 : 0, y: step >= 11 ? 0 : 20 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.2vh', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5vh' }}>{h.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.2vh', color: 'var(--color-text-secondary)' }}>{h.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="subtitle-overlay">
        Your action checklist is sorted by weakest areas first. The strategic plan covers three time horizons — 30 days, 90 days, and 12 months.
      </div>
    </motion.div>
  );
}
