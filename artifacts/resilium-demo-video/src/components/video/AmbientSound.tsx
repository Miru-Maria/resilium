import { useEffect, useRef, useState } from 'react';

export function AmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Layered ambient drone: three detuned sine waves
    const layers = [
      { freq: 55, gain: 0.05, detune: 0 },
      { freq: 82.5, gain: 0.03, detune: 5 },
      { freq: 110, gain: 0.02, detune: -3 },
    ];

    const nodes = layers.map(({ freq, gain, detune }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gainNode.gain.value = gain;
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      return { osc, gainNode };
    });

    // Slow filter sweep for movement
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 12);
    filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 24);

    // Keep suspended until user interacts
    ctx.suspend();

    return () => {
      nodes.forEach(({ osc }) => osc.stop());
      ctx.close();
    };
  }, []);

  function toggle() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
      setMuted(false);
    } else {
      ctx.suspend();
      setMuted(true);
    }
  }

  return (
    <button
      onClick={toggle}
      title={muted ? 'Enable ambient sound' : 'Mute'}
      style={{
        position: 'fixed',
        bottom: '3vh',
        right: '3vw',
        zIndex: 100,
        background: 'rgba(13,18,37,0.85)',
        border: '1px solid rgba(224,128,64,0.4)',
        borderRadius: '50%',
        width: '5vh',
        height: '5vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '2.2vh',
        color: 'var(--color-primary)',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s, opacity 0.2s',
        opacity: 0.7,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
