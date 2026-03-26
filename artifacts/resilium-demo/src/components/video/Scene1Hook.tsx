import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { charVariants, charContainerVariants } from '@/lib/video/animations';

export function Scene1Hook() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3500),
      setTimeout(() => setStep(3), 4500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const headline = "You're one disruption away from chaos.";
  const subline = "Economic shocks. Job loss. Health crises. Geopolitical instability.";
  
  const crisisWords = ["CRISIS", "SHOCK", "LOSS", "INSTABILITY", "UNKNOWN"];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-dark)] z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1 }}
    >
      {/* Background Video */}
      <motion.video
        src="/space-nebula.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 5, ease: "easeOut" }}
      />

      {/* Orbiting crisis words */}
      {step === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {crisisWords.map((word, i) => (
            <motion.div
              key={word}
              className="absolute text-[var(--color-error)] text-[2cqw] font-mono tracking-widest font-bold opacity-40"
              initial={{ rotate: i * (360 / crisisWords.length), x: '30cqw' }}
              animate={{
                rotate: [i * (360 / crisisWords.length), i * (360 / crisisWords.length) + 360],
                x: ['30cqw', '5cqw'],
                scale: [1, 0.5]
              }}
              transition={{ duration: 1.5, ease: "easeIn" }}
            >
              {word}
            </motion.div>
          ))}
          <motion.div
            className="w-[10cqw] h-[10cqw] rounded-full bg-[var(--color-bg-light)] border border-[var(--color-secondary)] shadow-2xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 0] }}
            transition={{ duration: 1.5, times: [0, 0.8, 1] }}
          />
        </div>
      )}

      {/* Main Content */}
      {step >= 1 && (
        <div className="z-10 text-center max-w-5xl px-12">
          <motion.h1 
            className="text-[5cqw] font-display font-bold leading-tight mb-8"
            variants={charContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {headline.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-4">
                {word.split('').map((char, j) => (
                  <motion.span key={j} className="inline-block" variants={charVariants}>
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="text-[2cqw] text-[var(--color-text-secondary)] font-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {subline}
          </motion.p>
        </div>
      )}

      {/* Resolution beat */}
      {step >= 2 && (
        <motion.div
          className="absolute bottom-[15cqh] text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[2cqw] text-[var(--color-text-primary)] font-body font-medium mb-[2cqh]">
            Most people aren't prepared. <span className="text-[var(--color-primary)]">Resilium changes that.</span>
          </p>
        </motion.div>
      )}

      {/* Tagline reveal */}
      {step >= 3 && (
        <motion.div
          className="absolute bottom-[8cqh] text-center w-full"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1 }}
        >
          <p className="text-[1.5cqw] text-[var(--color-text-muted)] font-mono tracking-widest uppercase">
            AI-powered personal resilience planning.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
