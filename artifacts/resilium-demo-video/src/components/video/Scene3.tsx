import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  const [step, setStep] = useState(-1);

  const steps = [
    { title: 'Mental Resilience', detail: '10 questions, 1-5 scale' },
    { title: 'Location', detail: 'London, UK' },
    { title: 'Income Stability', detail: 'Freelance / Variable' },
    { title: 'Financial Buffer', detail: '3 Months' },
    { title: 'Skills', detail: 'Digital/Tech, First Aid' },
    { title: 'Health & Mobility', detail: 'Fully Mobile' },
    { title: 'Housing', detail: 'Renting long-term' },
    { title: 'Risk Concerns', detail: 'Job Loss, Hyperinflation' },
  ];

  useEffect(() => {
    const timers = steps.map((_, i) => 
      setTimeout(() => setStep(i), 1000 + i * 2000) // Show a new step every 2 seconds
    );
    
    // Final text reveal
    timers.push(setTimeout(() => setStep(steps.length), 1000 + steps.length * 2000 + 1000));
    
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[var(--color-bg-dark)] overflow-hidden"
      {...sceneTransitions.morphExpand}
    >
      <img
        src="/images/risk-map.png"
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        alt="Risk map background"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-transparent to-[var(--color-bg-dark)] opacity-90" />

      {/* Kinetic sequence container */}
      <div className="relative w-[80vw] h-[60vh] flex flex-col justify-center items-start pl-[10vw]">
        {steps.map((s, i) => {
          const isActive = step === i;
          const isPast = step > i;
          
          return (
            <motion.div
              key={i}
              className="absolute left-[10vw]"
              initial={{ opacity: 0, y: '50vh', scale: 0.8 }}
              animate={{
                opacity: isActive ? 1 : isPast ? 0 : 0,
                y: isActive ? '0vh' : isPast ? '-50vh' : '50vh',
                scale: isActive ? 1 : isPast ? 1.2 : 0.8,
                filter: isActive ? 'blur(0px)' : 'blur(10px)'
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-[var(--color-primary)] font-mono text-[2vh] mb-[1vh] tracking-widest uppercase">
                Step {i + 1} / {steps.length}
              </div>
              <h2 className="font-display text-[8vh] font-bold text-[var(--color-text-primary)] leading-tight tracking-tight">
                {s.title}
              </h2>
              <div className="mt-[2vh] inline-block bg-[var(--color-bg-muted)] border border-[var(--color-text-muted)] rounded-full px-[3vh] py-[1vh]">
                <span className="font-body text-[3vh] text-[var(--color-text-secondary)]">
                  {s.detail}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Final massive text */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center w-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: step === steps.length ? 1 : 0,
            scale: step === steps.length ? 1 : 0.5
          }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.3 }}
        >
          <h1 className="font-display text-[10vh] font-bold text-[var(--color-primary)] leading-none tracking-tighter">
            Ten dimensions.<br />
            <span className="text-[var(--color-text-primary)]">Ten minutes.</span>
          </h1>
        </motion.div>
      </div>

      <div className="subtitle-overlay">
        The assessment takes about ten minutes and covers dimensions from mental resilience to financial buffer and location-specific risks.
      </div>
    </motion.div>
  );
}
