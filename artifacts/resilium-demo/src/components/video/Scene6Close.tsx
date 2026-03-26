import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene6Close() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), // Resilium
      setTimeout(() => setStep(2), 2000), // Know
      setTimeout(() => setStep(3), 3000), // Build
      setTimeout(() => setStep(4), 4000), // Be ready
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const lines = [
    { text: "Know your vulnerabilities.", delay: 0 },
    { text: "Build your plan.", delay: 0 },
    { text: "Be ready for whatever comes next.", delay: 0 }
  ];

  return (
    <motion.div 
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--color-bg-dark)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Background glow from center */}
      <motion.div 
        className="absolute inset-0 bg-radial from-[rgba(224,128,64,0.1)] to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      <div className="z-10 flex flex-col items-center text-center w-full px-8">
        {step >= 1 && (
          <motion.h1 
            className="text-[8cqw] font-display font-bold text-gradient-orange mb-[6cqh] tracking-tight leading-none"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            RESILIUM.
          </motion.h1>
        )}

        <div className="space-y-[2cqh]">
          {step >= 2 && (
            <motion.p 
              className="text-[2.5cqw] font-body text-[var(--color-text-primary)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Know your vulnerabilities.
            </motion.p>
          )}
          
          {step >= 3 && (
            <motion.p 
              className="text-[2.5cqw] font-body text-[var(--color-text-primary)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Build your plan.
            </motion.p>
          )}
          
          {step >= 4 && (
            <motion.p 
              className="text-[3cqw] font-display font-bold text-[var(--color-primary)] mt-[4cqh]"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Be ready for whatever comes next.
            </motion.p>
          )}
        </div>

        {step >= 4 && (
          <motion.div 
            className="absolute bottom-[8cqh] w-full text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div className="flex items-center justify-center gap-4 text-[1.5cqw] font-mono text-[var(--color-text-secondary)] tracking-widest">
              <span>RESILIUM.AI</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
