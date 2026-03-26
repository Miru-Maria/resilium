import { motion } from 'framer-motion';

export function HexagonGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-5">
      <motion.div
        className="absolute inset-0"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92304845413264' viewBox='0 0 60 103.92304845413264' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 103.92304845413264l-30-17.320508075688775v-34.64101615137755l30-17.32050807568877l30 17.32050807568877v34.64101615137755z' fill-opacity='0' stroke='%23E08040' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 103.92304845413264px',
          width: '200%',
          height: '200%',
        }}
      />
    </div>
  );
}
