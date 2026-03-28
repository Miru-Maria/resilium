import React, { useEffect, useRef, useState } from "react";
import Svg, { Circle, Line } from "react-native-svg";

interface NParticle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  isOrange: boolean;
}

interface NeuralNetSVGProps {
  width: number;
  height: number;
  opacity?: number;
  particleCount?: number;
}

export function NeuralNetSVG({ width, height, opacity = 0.7, particleCount = 22 }: NeuralNetSVGProps) {
  const [, setTick] = useState(0);
  const particlesRef = useRef<NParticle[]>([]);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const lastTimeRef = useRef(0);
  const CONN_DIST = Math.min(width, height) * 0.45;
  const FPS_INTERVAL = 1000 / 20;

  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.6 + 0.9,
      isOrange: Math.random() > 0.45,
    }));

    const animate = (time: number) => {
      if (time - lastTimeRef.current >= FPS_INTERVAL) {
        lastTimeRef.current = time;
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          else if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          else if (p.y > height + 10) p.y = -10;
        }
        setTick((t) => t + 1);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [width, height, particleCount]);

  const particles = particlesRef.current;
  const lines: React.ReactNode[] = [];

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONN_DIST) {
        const alpha = Math.round((1 - dist / CONN_DIST) * 0.38 * 255).toString(16).padStart(2, "0");
        const bothOrange = particles[i].isOrange && particles[j].isOrange;
        lines.push(
          <Line
            key={`${i}-${j}`}
            x1={particles[i].x} y1={particles[i].y}
            x2={particles[j].x} y2={particles[j].y}
            stroke={bothOrange ? `#E08040${alpha}` : `#7890E0${alpha}`}
            strokeWidth={1.0}
          />
        );
      }
    }
  }

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0, opacity }}
      pointerEvents="none"
    >
      {lines}
      {particles.map((p, i) => {
        const hex = p.isOrange ? "#E08040" : "#7890E0";
        return (
          <React.Fragment key={i}>
            <Circle cx={p.x} cy={p.y} r={p.r * 2.8} fill={hex} fillOpacity={0.13} />
            <Circle cx={p.x} cy={p.y} r={p.r} fill={hex} fillOpacity={0.85} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
