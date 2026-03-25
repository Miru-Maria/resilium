import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

// CSS filter: convert black PNG logo → Resilium orange (#E08040)
const LOGO_FILTER =
  'invert(58%) sepia(58%) saturate(700%) hue-rotate(334deg) brightness(97%) contrast(97%)';

export function PersistentElements({ currentScene }: { currentScene: number }) {
  return (
    <>
      {/* Slow-drifting ambient orb */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '55vw',
          height: '55vw',
          background: 'radial-gradient(circle, rgba(224,128,64,0.14) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        animate={{
          x: currentScene % 2 === 0 ? '-8vw' : '22vw',
          y: currentScene % 3 === 0 ? '-12vh' : '4vh',
          scale: currentScene === 5 ? 1.3 : 1,
          opacity: currentScene === 5 ? 0.30 : 0.18,
        }}
        transition={{ duration: 3.5, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Logo watermark — top-left */}
      <motion.div
        className="absolute top-[3vh] left-[3vw] z-50 flex items-center gap-[1.2vh]"
        animate={{ opacity: currentScene === 5 ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={`${BASE}images/logo.png`}
          alt="Resilium"
          style={{
            width: '3.5vh',
            height: '3.5vh',
            objectFit: 'contain',
            filter: LOGO_FILTER,
          }}
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
