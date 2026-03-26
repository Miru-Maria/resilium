import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene3Assessment() {
  const [step, setStep] = useState(0);

  const steps = [
    "Mental Resilience",
    "Location",
    "Income",
    "Skills",
    "Health",
    "Risk Concerns"
  ];

  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(prev => prev + 1), 500 + i * 500));
    timers.push(setTimeout(() => setStep(10), 4000));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex z-20 bg-[var(--color-bg-dark)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left side: Content */}
      <div className="w-1/2 flex flex-col justify-center px-[5cqw] h-full relative z-10">
        <motion.h2 
          className="text-[4cqw] font-display font-bold mb-8 text-gradient-orange leading-tight"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          11 dimensions of personal preparedness.
        </motion.h2>

        <div className="flex gap-4 mt-8">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="h-2 w-12 rounded-full"
              style={{ backgroundColor: i < step ? 'var(--color-primary)' : 'var(--color-secondary)' }}
              animate={{
                scale: i === step - 1 ? [1, 1.2, 1] : 1,
                boxShadow: i === step - 1 ? '0 0 10px var(--color-primary)' : 'none'
              }}
            />
          ))}
        </div>

        {step >= 10 && (
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-[3cqw] font-display text-[var(--color-text-primary)] leading-tight">
              Your answers.<br/>
              <span className="text-[var(--color-primary)]">Your profile.</span><br/>
              <span className="text-[var(--color-success)]">Your plan.</span>
            </h3>
          </motion.div>
        )}
      </div>

      {/* Right side: Cards */}
      <div className="w-1/2 relative h-full flex items-center justify-center">
        {/* World map background */}
        <motion.img
          src="/world-map.png"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 2 }}
        />

        <div className="relative w-full h-full flex items-center justify-center perspective-[1000px]">
          {steps.map((label, i) => {
            const isVisible = step > i;
            const isLatest = step === i + 1;
            
            return (
              <motion.div
                key={label}
                className="absolute w-[25cqw] bg-[var(--color-bg-light)] border border-[var(--color-secondary)] p-[2cqw] rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-[1.5cqw]"
                initial={{ x: '50cqw', opacity: 0, rotateY: -45, z: -500 }}
                animate={isVisible ? {
                  x: (steps.length - 1 - i) * 15,
                  y: (steps.length - 1 - i) * -15,
                  z: i * 50,
                  opacity: 1,
                  rotateY: 0,
                  scale: isLatest ? 1.05 : 1,
                  borderColor: isLatest ? 'var(--color-primary)' : 'var(--color-secondary)',
                  boxShadow: isLatest ? '0 20px 40px rgba(224, 128, 64, 0.2)' : '0 10px 30px rgba(0,0,0,0.5)'
                } : { x: '50cqw', opacity: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              >
                <div className="w-[4cqw] h-[4cqw] rounded-full bg-[var(--color-bg-dark)] border border-[var(--color-secondary)] flex items-center justify-center">
                  <div className="w-[2cqw] h-[2cqw] rounded-full bg-[var(--color-primary)] opacity-50" />
                </div>
                <h4 className="text-[1.5cqw] font-mono text-[var(--color-text-primary)]">{label}</h4>
                <div className="w-full space-y-[1cqh]">
                  <div className="h-[1cqh] bg-[var(--color-bg-dark)] rounded w-full"></div>
                  <div className="h-[1cqh] bg-[var(--color-bg-dark)] rounded w-5/6"></div>
                  <div className="h-[1cqh] bg-[var(--color-bg-dark)] rounded w-4/6"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
