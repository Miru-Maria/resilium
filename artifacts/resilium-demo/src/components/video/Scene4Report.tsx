import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene4Report() {
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Score counter
    const scoreInterval = setInterval(() => {
      setScore(prev => {
        if (prev < 54) return prev + 2;
        clearInterval(scoreInterval);
        return 54;
      });
    }, 40);

    const timers = [
      setTimeout(() => setStep(1), 2000), // Radar chart
      setTimeout(() => setStep(2), 3500), // Checklist items
      setTimeout(() => setStep(3), 5000), // Timelines
    ];

    return () => {
      clearInterval(scoreInterval);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  const spokes = ['Financial', 'Health', 'Skills', 'Mobility', 'Psychological', 'Resources'];
  const checklist = [
    "Build 3-month emergency fund",
    "Complete off-grid first aid",
    "Map secondary evacuation route"
  ];

  return (
    <motion.div 
      className="absolute inset-0 z-20 flex bg-[var(--color-bg-dark)] overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 1, ease: "circOut" }}
    >
      <motion.img
        src="/data-streams.png"
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />

      <div className="w-full flex h-full p-[4cqw] gap-[4cqw] relative z-10">
        {/* Left Column: Score & Radar */}
        <div className="w-1/2 flex flex-col items-center justify-center relative">
          
          <motion.div 
            className="text-center mb-[4cqh]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[2cqw] font-body text-[var(--color-text-secondary)] mb-4">Overall Score</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-[7cqw] font-display font-bold text-[var(--color-primary)] leading-none">{score}</span>
              <span className="text-[3cqw] text-[var(--color-text-muted)]">/100</span>
            </div>
            <p className="mt-4 text-[1.5cqw] font-mono text-[var(--color-warning)] uppercase tracking-widest">Moderately Prepared</p>
          </motion.div>

          {/* Simple Radar Chart Representation */}
          <div className="relative w-[30cqw] h-[30cqw] flex items-center justify-center">
            {step >= 1 && (
              <>
                {/* Background Web */}
                <motion.svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full overflow-visible">
                  {[0.3, 0.6, 1].map((scale, i) => (
                    <motion.polygon
                      key={`grid-${i}`}
                      points="100,0 186.6,50 186.6,150 100,200 13.4,150 13.4,50"
                      fill="none"
                      stroke="var(--color-secondary)"
                      strokeWidth="1"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale, opacity: 1 }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      style={{ transformOrigin: 'center' }}
                    />
                  ))}
                  
                  {/* Spokes */}
                  {spokes.map((label, i) => {
                    const angle = (i * 60 - 90) * (Math.PI / 180);
                    const x2 = 100 + 100 * Math.cos(angle);
                    const y2 = 100 + 100 * Math.sin(angle);
                    
                    return (
                      <g key={label}>
                        <motion.line
                          x1="100" y1="100" x2={x2} y2={y2}
                          stroke="var(--color-secondary)"
                          strokeWidth="1"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        />
                        <motion.text
                          x={100 + 120 * Math.cos(angle)}
                          y={100 + 120 * Math.sin(angle)}
                          fill="var(--color-text-secondary)"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          {label}
                        </motion.text>
                      </g>
                    );
                  })}

                  {/* Data Polygon */}
                  <motion.polygon
                    points="100,20 150,60 170,140 100,160 40,130 50,40"
                    fill="rgba(224, 128, 64, 0.3)"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 1, type: "spring" }}
                    style={{ transformOrigin: 'center' }}
                  />
                </motion.svg>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Action Plan */}
        <div className="w-1/2 flex flex-col justify-center gap-[3cqh]">
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-[2.5cqw] font-display text-[var(--color-error)] mb-[2cqh]">
                Critical vulnerabilities — surfaced and ranked.
              </h3>
              
              <div className="space-y-[1.5cqh]">
                {checklist.map((item, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-center gap-[1.5cqw] bg-[var(--color-bg-light)] border border-[var(--color-secondary)] p-[1.5cqw] rounded-lg"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.3 }}
                  >
                    <motion.div 
                      className="w-[2cqw] h-[2cqw] rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center shrink-0"
                      initial={{ backgroundColor: 'transparent' }}
                      animate={{ backgroundColor: 'var(--color-primary)' }}
                      transition={{ delay: 1 + i * 0.3 }}
                    >
                      <motion.svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw] text-[var(--color-bg-dark)]" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 + i * 0.3 }}>
                        <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </motion.div>
                    <span className="text-[1.5cqw] font-body text-[var(--color-text-primary)]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div
              className="flex gap-[1cqw]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {['30-day plan', '90-day plan', '12-month plan'].map((plan, i) => (
                <motion.div
                  key={plan}
                  className={`flex-1 p-[1cqw] rounded-xl text-center font-mono text-[1.2cqw] ${i === 0 ? 'bg-[var(--color-primary)] text-[var(--color-bg-dark)]' : 'bg-[var(--color-bg-light)] text-[var(--color-text-secondary)] border border-[var(--color-secondary)]'}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                >
                  {plan}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
