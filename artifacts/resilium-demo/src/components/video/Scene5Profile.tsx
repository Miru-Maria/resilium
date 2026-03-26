import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene5Profile() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), // overlay radar
      setTimeout(() => setStep(2), 2500), // admin dash
      setTimeout(() => setStep(3), 4000), // AI UX Testing
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 z-20 flex bg-[var(--color-bg-dark)]"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      {/* Left Screen: Profile / Progress */}
      <motion.div 
        className="w-1/2 border-r border-[var(--color-secondary)] p-[4cqw] flex flex-col justify-center bg-[var(--color-bg-light)]"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
      >
        <h2 className="text-[3cqw] font-display font-bold text-[var(--color-text-primary)] mb-4 leading-tight">
          Every report saved to your profile.
        </h2>
        <p className="text-[1.5cqw] text-[var(--color-primary)] font-mono mb-12">Track your progress.</p>

        <div className="relative h-[25cqw] w-full flex items-center justify-center">
          {/* Base Radar */}
          <motion.div className="absolute w-[20cqw] h-[20cqw] border border-[var(--color-secondary)] rounded-full flex items-center justify-center opacity-50">
            <div className="w-[14cqw] h-[14cqw] border border-[var(--color-secondary)] rounded-full"></div>
            <div className="absolute w-full h-[1px] bg-[var(--color-secondary)]"></div>
            <div className="absolute h-full w-[1px] bg-[var(--color-secondary)]"></div>
          </motion.div>

          {/* Previous Score Polygon */}
          <motion.svg viewBox="0 0 100 100" className="absolute w-[20cqw] h-[20cqw]">
            <polygon points="50,20 70,40 80,80 50,90 20,70 30,30" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="4 4" />
          </motion.svg>

          {/* New Score Polygon (overlay) */}
          {step >= 1 && (
            <motion.svg viewBox="0 0 100 100" className="absolute w-[20cqw] h-[20cqw] z-10">
              <motion.polygon 
                points="50,10 80,30 90,90 50,95 10,80 20,20" 
                fill="rgba(92, 184, 122, 0.2)" 
                stroke="var(--color-success)" 
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, type: "spring" }}
                style={{ transformOrigin: 'center' }}
              />
            </motion.svg>
          )}

          {step >= 1 && (
            <motion.div 
              className="absolute -right-8 -top-8 bg-[var(--color-success)] text-[var(--color-bg-dark)] font-bold text-2xl p-4 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
            >
              +12
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right Screen: Admin */}
      <motion.div 
        className="w-1/2 p-[4cqw] flex flex-col justify-center bg-[#090C1A]"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
      >
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[3cqw] font-display font-bold text-[var(--color-text-primary)] mb-[2cqh]">
              Admin dashboard: platform health at a glance.
            </h2>

            <div className="grid grid-cols-2 gap-[2cqw] mb-[4cqh]">
              {[
                { label: "Active Users", val: "12,402", color: "var(--color-primary)" },
                { label: "Plans Generated", val: "48,193", color: "var(--color-success)" },
                { label: "System Health", val: "99.9%", color: "var(--color-text-primary)" },
                { label: "Avg Score", val: "48/100", color: "var(--color-warning)" }
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  className="bg-[var(--color-bg-light)] p-[1.5cqw] rounded-xl border border-[var(--color-secondary)]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-[1cqw] font-mono text-[var(--color-text-secondary)] mb-[0.5cqw]">{stat.label}</div>
                  <div className="text-[2.5cqw] font-display font-bold" style={{ color: stat.color }}>{stat.val}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-error)] p-[1px] rounded-xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-[var(--color-bg-dark)] p-[1.5cqw] rounded-xl h-full flex items-center gap-[1.5cqw]">
              <div className="w-[4cqw] h-[4cqw] rounded-full bg-[rgba(224,128,64,0.1)] flex items-center justify-center text-[var(--color-primary)]">
                <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <h4 className="text-[1.5cqw] font-display font-bold text-[var(--color-text-primary)]">AI UX Testing Suite</h4>
                <p className="text-[1.2cqw] text-[var(--color-text-secondary)]">Autonomous personas, zero waiting.</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
