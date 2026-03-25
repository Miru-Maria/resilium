import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 5000), // "Most people aren't prepared."
      setTimeout(() => setStep(2), 12000), // Reveal Resilium
      setTimeout(() => setStep(3), 18000), // App preview
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...sceneTransitions.morphExpand}
    >
      <video
        src="/videos/bg-particles.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-bg-light)] opacity-80" />

      <motion.div className="relative z-20 flex flex-col items-center text-center px-[10vw]">
        <motion.h1
          className="font-display text-[6vh] md:text-[8vh] leading-[1.1] font-bold tracking-tight mb-[4vh] text-[var(--color-text-primary)]"
          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
          animate={{ 
            opacity: step >= 0 && step < 2 ? 1 : 0, 
            y: step >= 0 && step < 2 ? 0 : -50,
            filter: step >= 0 && step < 2 ? 'blur(0px)' : 'blur(10px)'
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          You're one disruption away<br />
          <span className="text-[var(--color-secondary)]">from chaos.</span>
        </motion.h1>

        <motion.h2
          className="font-body text-[3vh] md:text-[4vh] text-[var(--color-text-secondary)]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: step >= 1 && step < 2 ? 1 : 0,
            y: step >= 1 && step < 2 ? 0 : 30 
          }}
          transition={{ duration: 1, ease: 'circOut' }}
        >
          Most people aren't prepared.
        </motion.h2>

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: step >= 2 ? 1 : 0,
            scale: step >= 2 ? 1 : 0.8,
            y: step >= 3 ? '-20vh' : '0vh'
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-[10vh] font-bold tracking-tighter text-[var(--color-primary)]">Resilium</h1>
          <p className="font-body text-[2.5vh] tracking-[0.2em] text-[var(--color-text-secondary)] mt-[1vh] uppercase">Personal Resilience Platform</p>
        </motion.div>
        
        {/* App Mockup reveal */}
        <motion.div
          className="absolute top-[60vh] w-[60vw] h-[33.75vw] rounded-xl overflow-hidden border border-[var(--color-text-muted)] shadow-[0_0_50px_rgba(224,128,64,0.2)]"
          initial={{ opacity: 0, y: '20vh', rotateX: 20, transformPerspective: 1000 }}
          animate={{ 
            opacity: step >= 3 ? 1 : 0,
            y: step >= 3 ? '0vh' : '20vh',
            rotateX: step >= 3 ? 0 : 20
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src="/images/resilium-thumbnail.png" className="w-full h-full object-cover" alt="Resilium App" />
        </motion.div>
      </motion.div>

      <div className="subtitle-overlay">
        We live in an era of constant disruption — economic shocks, job loss, health crises. Most people aren't prepared. Resilium changes that.
      </div>
    </motion.div>
  );
}
