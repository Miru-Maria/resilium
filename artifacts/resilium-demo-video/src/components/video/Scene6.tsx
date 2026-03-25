import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;

export function Scene6() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2800),
      setTimeout(() => setStep(3), 4800),
      setTimeout(() => setStep(4), 8500),
      setTimeout(() => setStep(5), 10500),
      setTimeout(() => setStep(6), 18000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ background: '#050810' }}
      {...sceneTransitions.clipPolygon}
    >
      <video
        src={`${BASE}videos/bg-landscape.mp4`}
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.38, mixBlendMode: 'screen', pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #050810 0%, rgba(5,8,16,0.3) 50%, rgba(5,8,16,0.7) 100%)' }} />

      {/* Stacked taglines */}
      <motion.div
        style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vh', zIndex: 20, padding: '0 10vw' }}
        animate={{ opacity: step >= 4 ? 0 : 1, scale: step >= 4 ? 1.08 : 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '7.5vh', fontWeight: 700, color: 'rgba(234,217,190,0.65)', letterSpacing: '-0.03em', margin: 0 }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 35 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Know your vulnerabilities.
        </motion.h1>
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '7.5vh', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 35 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Build your plan.
        </motion.h1>
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '10vh', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.04em', margin: '1.5vh 0 0 0' }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: step >= 3 ? 1 : 0, scale: step >= 3 ? 1 : 0.82 }}
          transition={{ duration: 1.4, type: 'spring', bounce: 0.35 }}
        >
          Be ready.
        </motion.h1>
      </motion.div>

      {/* Logo lockup */}
      <motion.div
        style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: step >= 4 && step < 6 ? 1 : 0, scale: step >= 4 && step < 6 ? 1 : step >= 6 ? 1.1 : 0.88 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '3.5vh', marginBottom: '5vh' }}>
          <img
            src={`${BASE}images/logo.png`}
            alt="Resilium"
            style={{ width: '12vh', height: '12vh', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(224,128,64,0.5))' }}
          />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '13vh', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>
            Resilium
          </h1>
        </div>

        <motion.div
          style={{
            padding: '2.2vh 7vh',
            background: 'var(--color-primary)',
            borderRadius: '100px',
            boxShadow: '0 0 50px rgba(224,128,64,0.45), 0 12px 30px rgba(0,0,0,0.4)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 5 ? 1 : 0, y: step >= 5 ? 0 : 30 }}
          transition={{ duration: 1, delay: 0.4, type: 'spring' }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '3vh', color: 'var(--color-bg-light)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Get My Resilience Plan
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        className="subtitle-overlay"
        animate={{ opacity: step < 6 ? 0.9 : 0 }}
        transition={{ duration: 1 }}
      >
        Resilium. Know your vulnerabilities. Build your plan. Be ready for whatever comes next.
      </motion.div>
    </motion.div>
  );
}
