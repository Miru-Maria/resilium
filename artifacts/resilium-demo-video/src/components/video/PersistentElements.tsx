import { motion } from 'framer-motion';

export function PersistentElements({ currentScene }: { currentScene: number }) {
  return (
    <>
      {/* Background radial gradient orb drifting */}
      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
          zIndex: 0
        }}
        animate={{
          x: currentScene % 2 === 0 ? '-10vw' : '30vw',
          y: currentScene % 3 === 0 ? '-20vh' : '10vh',
          scale: currentScene === 5 ? 1.5 : 1,
          opacity: currentScene === 5 ? 0.3 : 0.2
        }}
        transition={{ duration: 15, ease: 'linear' }}
      />
      
      {/* Small "R" logo top-left */}
      <motion.div
        className="absolute top-[4vh] left-[4vw] z-50 flex items-center justify-center w-[4vh] h-[4vh] rounded border border-[var(--color-primary)] font-display text-[2vh] font-bold text-[var(--color-primary)]"
        animate={{
          opacity: currentScene === 5 ? 0 : 1 // Hide in last scene where full logo appears
        }}
        transition={{ duration: 1 }}
      >
        R
      </motion.div>
    </>
  );
}
