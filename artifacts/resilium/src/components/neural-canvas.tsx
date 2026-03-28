import React, { useRef, useEffect } from "react";

interface NParticle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  isOrange: boolean;
}

interface NeuralCanvasProps {
  opacity?: number;
  particleCount?: number;
  connectionDist?: number;
  className?: string;
}

export function NeuralCanvas({
  opacity = 0.85,
  particleCount = 90,
  connectionDist = 170,
  className = "absolute inset-0 w-full h-full",
}: NeuralCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let W = 0, H = 0;
    let particles: NParticle[] = [];

    function init() {
      W = canvas!.clientWidth || window.innerWidth;
      H = canvas!.clientHeight || window.innerHeight;
      canvas!.width = W;
      canvas!.height = H;
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.8 + 0.8,
        isOrange: Math.random() > 0.45,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.58;
            const bothOrange = particles[i].isOrange && particles[j].isOrange;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = bothOrange
              ? `rgba(224,128,64,${alpha})`
              : `rgba(120,140,225,${alpha * 0.88})`;
            ctx!.lineWidth = 1.2;
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        const color = p.isOrange ? "224,128,64" : "120,140,225";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},0.20)`;
        ctx!.fill();
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},0.92)`;
        ctx!.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        else if (p.y > H + 10) p.y = -10;
      }

      animFrame = requestAnimationFrame(draw);
    }

    function handleResize() { init(); }

    init();
    draw();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [particleCount, connectionDist]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity }}
    />
  );
}
