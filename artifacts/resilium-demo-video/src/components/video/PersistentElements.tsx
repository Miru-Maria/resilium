import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

export function PersistentElements({ currentScene }: { currentScene: number }) {
  return (
    <>
      {/* Slow-drifting ambient orb */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(224,128,64,0.18) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: currentScene % 2 === 0 ? '-5vw' : '25vw',
          y: currentScene % 3 === 0 ? '-15vh' : '5vh',
          scale: currentScene === 5 ? 1.4 : 1,
          opacity: currentScene === 5 ? 0.35 : 0.22,
        }}
        transition={{ duration: 3.5, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Resilium logo — top-left, persists across all scenes */}
      <motion.div
        className="absolute top-[3vh] left-[3vw] z-50 flex items-center gap-[1.2vh]"
        animate={{ opacity: currentScene === 5 ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={`${BASE}images/logo.png`}
          alt="Resilium"
          style={{ width: '3.5vh', height: '3.5vh', objectFit: 'contain' }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2vh',
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Resilium
        </span>
      </motion.div>
    </>
  );
}
