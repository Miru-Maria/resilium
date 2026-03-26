import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene2Product() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const orbs = [
    { label: "Identity", color: "#E08040" },
    { label: "Location", color: "#5CB87A" },
    { label: "Lifestyle", color: "#EAD9BE" }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-radial from-[rgba(224,128,64,0.05)] to-transparent opacity-50" />

      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center h-full justify-center">
        
        {/* Top Text */}
        <motion.div 
          className="absolute top-[15%] text-center w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-[3cqw] font-display font-medium text-[var(--color-text-primary)] mb-4 px-8">
            Analyzes who you are, where you live, and how you live.
          </h2>
          {step >= 1 && (
            <motion.h3 
              className="text-[2cqw] font-body text-[var(--color-primary)]"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8 }}
            >
              Turns that into a personalized action plan.
            </motion.h3>
          )}
        </motion.div>

        {/* Floating Orbs */}
        <div className="relative h-[20cqh] w-full max-w-[60cqw] flex justify-center items-center mt-[10cqh]">
          {orbs.map((orb, i) => (
            <motion.div
              key={orb.label}
              className="absolute flex flex-col items-center"
              initial={{ 
                x: (i - 1) * 300, 
                y: 50, 
                scale: 0, 
                opacity: 0 
              }}
              animate={step < 2 ? { 
                x: (i - 1) * 200, 
                y: [0, -20, 0], 
                scale: 1, 
                opacity: 1 
              } : {
                x: 0,
                y: 0,
                scale: 1.5,
                opacity: 0
              }}
              transition={step < 2 ? {
                x: { duration: 1, type: "spring" },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                scale: { duration: 0.8, delay: i * 0.1 },
                opacity: { duration: 0.8, delay: i * 0.1 }
              } : { duration: 1, ease: "easeInOut" }}
            >
              <div 
                className="w-[10cqw] h-[10cqw] rounded-full blur-md"
                style={{ backgroundColor: orb.color, opacity: 0.6 }}
              />
              <div 
                className="absolute w-[6cqw] h-[6cqw] rounded-full border-2 top-[1cqw]"
                style={{ borderColor: orb.color, boxShadow: `0 0 20px ${orb.color}` }}
              />
              <p className="mt-[2cqw] font-mono text-[1.5cqw] tracking-widest" style={{ color: orb.color }}>{orb.label}</p>
            </motion.div>
          ))}

          {/* Merged Pulse */}
          {step >= 2 && (
            <motion.div
              className="absolute w-[15cqw] h-[15cqw] rounded-full bg-[var(--color-primary)] mix-blend-screen"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 4], 
                opacity: [1, 0.5, 0] 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          )}
        </div>

        {/* Stats Trio */}
        {step >= 2 && (
          <motion.div 
            className="absolute bottom-[10%] w-full flex justify-center gap-[4cqw] px-[6cqw]"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            {[
              { stat: "360°", label: "Analysis" },
              { stat: "1M+", label: "Scenarios" },
              { stat: "100%", label: "Personalized" }
            ].map((item) => (
              <motion.div 
                key={item.label}
                className="text-center bg-[var(--color-bg-light)] border border-[var(--color-secondary)] p-[2cqw] rounded-xl flex-1"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
                }}
              >
                <div className="text-[4cqw] font-display font-bold text-[var(--color-primary)] mb-[1cqw]">{item.stat}</div>
                <div className="text-[1.5cqw] font-mono text-[var(--color-text-secondary)] uppercase tracking-wider">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
