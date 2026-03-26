import { motion } from 'framer-motion';

interface GlowingRingProps {
  currentScene: number;
}

export function GlowingRing({ currentScene }: GlowingRingProps) {
  // Define positions and sizes for each scene
  const states = [
    { left: '50%', top: '50%', scale: 0, opacity: 0 }, // Scene 0: Hook - start hidden, will expand
    { left: '50%', top: '50%', scale: 2, opacity: 0.15 }, // Scene 1: Product - center, large
    { left: '80%', top: '30%', scale: 0.8, opacity: 0.2 }, // Scene 2: Assessment - top right
    { left: '20%', top: '70%', scale: 1.5, opacity: 0.1 }, // Scene 3: Report - bottom left
    { left: '50%', top: '50%', scale: 1, opacity: 0.1 }, // Scene 4: Profile - center
    { left: '50%', top: '50%', scale: 0.1, opacity: 1 }, // Scene 5: Close - small intense point
  ];

  const currentState = states[currentScene] || states[0];

  return (
    <motion.div
      className="absolute w-[40cqw] h-[40cqw] rounded-full pointer-events-none z-10"
      style={{
        border: '2px solid var(--color-primary)',
        boxShadow: '0 0 60px var(--color-primary), inset 0 0 60px var(--color-primary)',
        transform: 'translate(-50%, -50%)',
      }}
      initial={states[0]}
      animate={currentState}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
