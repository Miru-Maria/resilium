import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), // Reveal score
      setTimeout(() => setStep(2), 3000), // Reveal label
      setTimeout(() => setStep(3), 6000), // Shift layout, reveal UI mockup
      setTimeout(() => setStep(4), 9000), // Reveal text lines
      setTimeout(() => setStep(5), 11000), // Reveal text lines
      setTimeout(() => setStep(6), 13000), // Reveal text lines
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-10 bg-[var(--color-bg-light)]"
      {...sceneTransitions.splitHorizontal}
    >
      <img
        src="/images/data-orb.png"
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
        alt="Data orb background"
      />

      {/* Massive Score Reveal */}
      <motion.div
        className="absolute flex flex-col items-center justify-center"
        animate={{
          x: step >= 3 ? '-25vw' : '0vw',
          scale: step >= 3 ? 0.7 : 1,
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative flex items-center justify-center w-[40vh] h-[40vh]"
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.5, rotate: step >= 1 ? 0 : -90 }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="var(--color-bg-muted)" strokeWidth="4" />
            <motion.circle 
              cx="50%" cy="50%" r="45%" fill="none" 
              stroke="var(--color-primary)" strokeWidth="6" 
              strokeDasharray="283" // ~ 2 * pi * 45
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: step >= 1 ? 283 * (1 - 0.54) : 283 }}
              transition={{ duration: 2, delay: 0.5, ease: 'circOut' }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="font-display text-[12vh] font-bold text-[var(--color-primary)] leading-none">54</span>
            <span className="font-mono text-[3vh] text-[var(--color-text-muted)]">/ 100</span>
          </div>
        </motion.div>

        <motion.div
          className="mt-[4vh] px-[4vh] py-[1.5vh] rounded-full bg-[var(--color-bg-muted)] border border-[var(--color-primary)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
          transition={{ duration: 0.8, ease: 'circOut' }}
        >
          <span className="font-body text-[2.5vh] text-[var(--color-text-primary)] uppercase tracking-widest font-bold">
            Moderately Prepared
          </span>
        </motion.div>
      </motion.div>

      {/* Right side content */}
      <motion.div
        className="absolute right-[10vw] top-1/2 -translate-y-1/2 w-[40vw] flex flex-col gap-[4vh]"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: step >= 3 ? 1 : 0, x: step >= 3 ? 0 : 50 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="w-full aspect-video rounded-xl overflow-hidden border border-[var(--color-text-muted)] shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] to-transparent opacity-50 z-10" />
          <img src="/images/resilium-thumbnail.png" className="w-full h-full object-cover" alt="Resilium Report" />
        </motion.div>

        <div className="flex flex-col gap-[2vh]">
          <motion.h3
            className="font-display text-[4vh] font-bold text-[var(--color-text-primary)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: step >= 4 ? 1 : 0, x: step >= 4 ? 0 : 20 }}
          >
            Six weighted categories.
          </motion.h3>
          <motion.h3
            className="font-display text-[4vh] font-bold text-[var(--color-text-primary)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: step >= 5 ? 1 : 0, x: step >= 5 ? 0 : 20 }}
          >
            AI-written risk profile.
          </motion.h3>
          <motion.h3
            className="font-display text-[4vh] font-bold text-[var(--color-primary)]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: step >= 6 ? 1 : 0, x: step >= 6 ? 0 : 20 }}
          >
            Personalized to you.
          </motion.h3>
        </div>
      </motion.div>

      <div className="subtitle-overlay">
        Your overall resilience score is calculated across six weighted categories, followed by an AI-written risk profile summary that interprets your unique situation.
      </div>
    </motion.div>
  );
}
