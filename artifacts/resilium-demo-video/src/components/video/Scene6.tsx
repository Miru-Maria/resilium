import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene6() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), // "Know your vulnerabilities."
      setTimeout(() => setStep(2), 3000), // "Build your plan."
      setTimeout(() => setStep(3), 5000), // "Be ready."
      setTimeout(() => setStep(4), 9000), // Clear and reveal logo
      setTimeout(() => setStep(5), 11000), // CTA
      setTimeout(() => setStep(6), 16000), // Fade out for loop
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#000]"
      {...sceneTransitions.clipPolygon}
    >
      <video
        src="/videos/bg-landscape.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] to-transparent opacity-80" />

      {/* Tagline sequence */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-[3vh] z-20"
        animate={{ opacity: step >= 4 ? 0 : 1, scale: step >= 4 ? 1.1 : 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="font-display text-[7vh] font-bold text-[var(--color-text-secondary)] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 30 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Know your vulnerabilities.
        </motion.h1>
        <motion.h1
          className="font-display text-[7vh] font-bold text-[var(--color-text-primary)] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 30 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Build your plan.
        </motion.h1>
        <motion.h1
          className="font-display text-[9vh] font-bold text-[var(--color-primary)] tracking-tight mt-[2vh]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: step >= 3 ? 1 : 0, scale: step >= 3 ? 1 : 0.8 }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
        >
          Be ready.
        </motion.h1>
      </motion.div>

      {/* Logo Lockup & CTA */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: step >= 4 && step < 6 ? 1 : 0, 
          scale: step >= 4 && step < 6 ? 1 : step >= 6 ? 1.1 : 0.9 
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-[4vh] mb-[6vh]">
          <div className="flex items-center justify-center w-[12vh] h-[12vh] rounded-lg border-2 border-[var(--color-primary)]">
            <span className="font-display text-[7vh] font-bold text-[var(--color-primary)] leading-none">R</span>
          </div>
          <h1 className="font-display text-[12vh] font-bold text-[var(--color-text-primary)] tracking-tighter">
            Resilium
          </h1>
        </div>

        <motion.div
          className="px-[6vh] py-[2.5vh] bg-[var(--color-primary)] rounded-full shadow-[0_0_40px_rgba(224,128,64,0.4)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 5 ? 1 : 0, y: step >= 5 ? 0 : 30 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring' }}
        >
          <span className="font-body text-[3vh] text-[var(--color-bg-dark)] font-bold tracking-wide uppercase">
            Get My Resilience Plan
          </span>
        </motion.div>
      </motion.div>

      {/* Only show subtitle overlay before the final fade out */}
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
