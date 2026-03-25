import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene5() {
  const [step, setStep] = useState(0);

  const checklistItems = [
    "Build a 3-month emergency fund",
    "Prepare a 72-hour go-bag",
    "Identify secondary income streams",
    "Learn basic first aid",
    "Review local evacuation routes"
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000), // Show checklist
    ];
    
    // Tick off items one by one
    checklistItems.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(2 + i), 2500 + i * 1500));
    });

    // Show progress and text
    timers.push(setTimeout(() => setStep(10), 11000));
    timers.push(setTimeout(() => setStep(11), 13000));

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[var(--color-bg-dark)]"
      {...sceneTransitions.perspectiveFlip}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-bg-muted)_0%,_var(--color-bg-dark)_100%)] opacity-50" />

      <div className="relative z-20 flex flex-col w-[60vw]">
        
        {/* Checklist */}
        <div className="flex flex-col gap-[2vh] mb-[8vh]">
          {checklistItems.map((item, i) => {
            const isChecked = step >= 2 + i;
            return (
              <motion.div
                key={i}
                className={`flex items-center gap-[3vh] p-[2.5vh] rounded-lg border ${
                  isChecked ? 'bg-[var(--color-bg-light)] border-[var(--color-primary)]' : 'bg-[var(--color-bg-muted)] border-transparent'
                }`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -50 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`w-[4vh] h-[4vh] rounded flex items-center justify-center border-2 ${
                  isChecked ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
                }`}>
                  <motion.svg 
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    className="w-[2.5vh] h-[2.5vh] text-[var(--color-bg-dark)]"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isChecked ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.path d="M5 13l4 4L19 7" strokeDasharray="1" strokeDashoffset="0" />
                  </motion.svg>
                </div>
                <span className={`font-body text-[3vh] transition-colors duration-300 ${
                  isChecked ? 'text-[var(--color-text-primary)] line-through opacity-70' : 'text-[var(--color-text-primary)]'
                }`}>
                  {item}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar & Status */}
        <motion.div
          className="flex flex-col gap-[2vh]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: step >= 10 ? 1 : 0, y: step >= 10 ? 0 : 30 }}
          transition={{ duration: 1 }}
        >
          <div className="flex justify-between items-end">
            <span className="font-display text-[4vh] font-bold text-[var(--color-primary)]">
              Well Prepared <img src="/images/shield-icon.png" className="inline w-[5vh] h-[5vh] ml-2 -mt-2" alt="Shield" />
            </span>
            <span className="font-mono text-[2.5vh] text-[var(--color-text-secondary)]">Level 3 / 4</span>
          </div>
          <div className="w-full h-[1.5vh] bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-primary)]"
              initial={{ width: '40%' }}
              animate={{ width: step >= 10 ? '75%' : '40%' }}
              transition={{ duration: 2, ease: 'circOut' }}
            />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="mt-[8vh] text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: step >= 11 ? 1 : 0, scale: step >= 11 ? 1 : 0.9 }}
          transition={{ duration: 1, type: 'spring' }}
        >
          <h2 className="font-display text-[5vh] text-[var(--color-text-primary)] tracking-tight leading-tight">
            A prioritized action plan —<br />
            <span className="text-[var(--color-primary)]">30 days, 90 days, 12 months.</span>
          </h2>
        </motion.div>

      </div>

      <div className="subtitle-overlay">
        The Action Checklist is a prioritized, interactive task list sorted by your weakest areas first. The Strategic Action Plan lays out concrete steps over three time horizons.
      </div>
    </motion.div>
  );
}
