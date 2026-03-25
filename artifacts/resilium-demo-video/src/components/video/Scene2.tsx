import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2000), // Radar chart base
      setTimeout(() => setStep(2), 4000), // Draw spokes
      setTimeout(() => setStep(3), 8000), // Fill polygon
      setTimeout(() => setStep(4), 12000), // 360 text
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Six spokes
  const labels = ['Financial', 'Health', 'Skills', 'Mobility', 'Psychological', 'Resources'];
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[var(--color-bg-dark)]"
      {...sceneTransitions.clipCircle}
    >
      <video
        src="/videos/bg-network.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen"
      />

      <div className="absolute top-[15vh] text-center w-full z-20 px-[10vw]">
        <motion.h2
          className="font-body text-[3vh] md:text-[4vh] text-[var(--color-text-secondary)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Resilium is an AI-powered personal resilience platform.
        </motion.h2>
      </div>

      {/* Radar Chart */}
      <div className="relative w-[50vh] h-[50vh] mt-[5vh] z-20">
        {/* Hexagon base */}
        <motion.div
          className="absolute inset-0 border border-[var(--color-text-muted)] opacity-30"
          style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: step >= 1 ? 1 : 0, opacity: step >= 1 ? 0.3 : 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute inset-[15%] border border-[var(--color-text-muted)] opacity-20"
          style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: step >= 1 ? 1 : 0, opacity: step >= 1 ? 0.2 : 0 }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Spokes and Labels */}
        {angles.map((angle, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-[25vh] h-[1px] bg-[var(--color-text-muted)] origin-left opacity-30"
            style={{ transform: `rotate(${angle - 90}deg)` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: step >= 2 ? 1 : 0 }}
            transition={{ duration: 1, delay: step >= 2 ? i * 0.1 : 0, ease: 'circOut' }}
          >
            <div 
              className="absolute right-[-4vh] top-[-1.5vh] text-[1.5vh] font-mono text-[var(--color-text-secondary)] whitespace-nowrap"
              style={{ transform: `rotate(${-(angle - 90)}deg)` }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: step >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5, delay: step >= 2 ? 1 + i * 0.1 : 0 }}
              >
                {labels[i]}
              </motion.span>
            </div>
          </motion.div>
        ))}

        {/* Data Polygon */}
        <motion.div
          className="absolute inset-0 bg-[var(--color-primary)] mix-blend-screen opacity-40"
          style={{ clipPath: 'polygon(50% 20%, 80% 40%, 70% 80%, 50% 70%, 30% 60%, 40% 30%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: step >= 3 ? 1 : 0, opacity: step >= 3 ? 0.4 : 0 }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
        />
        <motion.div
          className="absolute inset-0 border-2 border-[var(--color-primary)]"
          style={{ clipPath: 'polygon(50% 20%, 80% 40%, 70% 80%, 50% 70%, 30% 60%, 40% 30%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: step >= 3 ? 1 : 0, opacity: step >= 3 ? 1 : 0 }}
          transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
        />
      </div>

      <motion.div
        className="absolute bottom-[20vh] text-center w-full z-20 px-[10vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 20 }}
        transition={{ duration: 1, ease: 'circOut' }}
      >
        <h1 className="font-display text-[6vh] font-bold text-[var(--color-primary)] tracking-tight">
          360° holistic risk profiling.
        </h1>
      </motion.div>

      <div className="subtitle-overlay">
        Resilium is an AI-powered personal resilience platform that analyzes who you are, where you live, and how you live — and turns that into a personalized action plan.
      </div>
    </motion.div>
  );
}
