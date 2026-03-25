import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

const BASE = import.meta.env.BASE_URL;
const LOGO_FILTER =
  'invert(58%) sepia(58%) saturate(700%) hue-rotate(334deg) brightness(97%) contrast(97%)';

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
      style={{ background: '#060a14' }}
      {...sceneTransitions.clipPolygon}
    >
      {/* Very subtle background video */}
      <video
        src={`${BASE}videos/bg-landscape.mp4`}
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, mixBlendMode: 'screen', pointerEvents: 'none' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #060a14 0%, rgba(6,10,20,0.5) 50%, rgba(6,10,20,0.8) 100%)' }} />

      {/* Stacked taglines */}
      <motion.div
        style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5vh', zIndex: 20, padding: '0 10vw' }}
        animate={{ opacity: step >= 4 ? 0 : 1, scale: step >= 4 ? 1.06 : 1 }}
        transition={{ duration: 1.2 }}
      >
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '8vh', fontWeight: 700, color: 'rgba(234,217,190,0.55)', letterSpacing: '-0.03em', margin: 0 }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 35 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Know your vulnerabilities.
        </motion.h1>
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '8vh', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 35 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Build your plan.
        </motion.h1>
        <motion.h1
          style={{ fontFamily: 'var(--font-display)', fontSize: '11vh', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.04em', margin: '2vh 0 0 0' }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: step >= 3 ? 1 : 0, scale: step >= 3 ? 1 : 0.82 }}
          transition={{ duration: 1.4, type: 'spring', bounce: 0.32 }}
        >
          Be ready.
        </motion.h1>
      </motion.div>

      {/* Final logo lockup */}
      <motion.div
        style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: step >= 4 && step < 6 ? 1 : 0, scale: step >= 4 && step < 6 ? 1 : 0.88 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4vh', marginBottom: '6vh' }}>
          <img
            src={`${BASE}images/logo.png`}
            alt="Resilium"
            style={{
              width: '13vh', height: '13vh', objectFit: 'contain',
              filter: `${LOGO_FILTER} drop-shadow(0 0 20px rgba(224,128,64,0.4))`,
            }}
          />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '14vh', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.05em', lineHeight: 1, margin: 0 }}>
            Resilium
          </h1>
        </div>

        <motion.div
          style={{ padding: '2.4vh 7.5vh', background: 'var(--color-primary)', borderRadius: '100px', boxShadow: '0 0 45px rgba(224,128,64,0.4), 0 12px 30px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 5 ? 1 : 0, y: step >= 5 ? 0 : 30 }}
          transition={{ duration: 1, delay: 0.3, type: 'spring' }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '3.2vh', color: '#0D1225', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
