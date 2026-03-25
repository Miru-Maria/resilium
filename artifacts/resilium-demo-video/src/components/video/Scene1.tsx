import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;
const LOGO_FILTER =
  'invert(58%) sepia(58%) saturate(700%) hue-rotate(334deg) brightness(97%) contrast(97%)';

export function Scene1() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 5000),
      setTimeout(() => setStep(2), 11000),
      setTimeout(() => setStep(3), 17000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      style={{ background: 'var(--color-bg-light)' }}
      {...sceneTransitions.morphExpand}
    >
      {/* Very subtle background video */}
      <video
        src={`${BASE}videos/bg-particles.mp4`}
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.09, mixBlendMode: 'screen', pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--color-bg-light) 0%, transparent 40%, var(--color-bg-light) 100%)' }} />

      <motion.div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 8vw', width: '100%' }}>

        {/* Hook */}
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '9.5vh', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4vh', color: 'var(--color-text-primary)' }}
          initial={{ opacity: 0, y: 60, filter: 'blur(12px)' }}
          animate={{
            opacity: step >= 0 && step < 2 ? 1 : 0,
            y: step >= 0 && step < 2 ? 0 : step < 2 ? 60 : -60,
            filter: step >= 0 && step < 2 ? 'blur(0px)' : 'blur(12px)',
          }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          You're one disruption<br />
          <span style={{ color: 'var(--color-secondary)' }}>away from chaos.</span>
        </motion.h1>

        <motion.p
          style={{ fontFamily: 'var(--font-body)', fontSize: '4vh', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step === 1 ? 1 : 0, y: step === 1 ? 0 : 30 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Most people aren't prepared.
        </motion.p>

        {/* Resilium reveal */}
        <motion.div
          style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', top: '50%', transform: 'translateY(-50%)' }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: step >= 2 ? 1 : 0,
            scale: step >= 2 ? 1 : 0.85,
            y: step >= 3 ? '-16vh' : '0vh',
          }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '3vh', marginBottom: '2vh' }}>
            <img
              src={`${BASE}images/logo.png`}
              alt="Resilium"
              style={{ width: '11vh', height: '11vh', objectFit: 'contain', filter: LOGO_FILTER }}
            />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '13vh', fontWeight: 800, letterSpacing: '-0.05em', color: 'var(--color-primary)', lineHeight: 1 }}>
              Resilium
            </h1>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '2.4vh', letterSpacing: '0.22em', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Personal Resilience Platform
          </p>
        </motion.div>

        {/* App mockup */}
        <motion.div
          style={{ position: 'absolute', top: '54vh', width: '65vw', aspectRatio: '16/9', borderRadius: '1.2vh', overflow: 'hidden', border: '1px solid rgba(234,217,190,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', perspective: '1000px' }}
          initial={{ opacity: 0, y: '22vh', rotateX: 16 }}
          animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? '0vh' : '22vh', rotateX: step >= 3 ? 4 : 16 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={`${BASE}images/resilium-thumbnail.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Resilium App" />
        </motion.div>
      </motion.div>

      <div className="subtitle-overlay">
        We live in an era of constant disruption — economic shocks, job loss, health crises. Most people aren't prepared. Resilium changes that.
      </div>
    </motion.div>
  );
}
