import { useEffect, useRef } from 'react';

interface AmbientSoundProps {
  enabled: boolean;
  onToggle: () => void;
}

export function AmbientSound({ enabled, onToggle }: AmbientSoundProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRefs = useRef<GainNode[]>([]);

  useEffect(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const layers = [
      { freq: 55, gain: 0.04 },
      { freq: 82.5, gain: 0.025, detune: 5 },
      { freq: 110, gain: 0.015, detune: -3 },
    ];

    gainRefs.current = layers.map(({ freq, gain, detune = 0 }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      gainNode.gain.value = gain;
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      return gainNode;
    });

    ctx.suspend();

    return () => {
      ctx.close();
    };
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (enabled) {
      ctx.resume();
    } else {
      ctx.suspend();
    }
  }, [enabled]);

  return (
    <button
      onClick={onToggle}
      title={enabled ? 'Mute audio' : 'Enable voice narration + ambient sound'}
      style={{
        position: 'fixed',
        bottom: '3vh',
        right: '3vw',
        zIndex: 100,
        background: enabled ? 'rgba(224,128,64,0.15)' : 'rgba(13,18,37,0.85)',
        border: `1px solid ${enabled ? 'rgba(224,128,64,0.7)' : 'rgba(224,128,64,0.3)'}`,
        borderRadius: '50%',
        width: '5.5vh',
        height: '5.5vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '2.4vh',
        color: 'var(--color-primary)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.25s',
        opacity: enabled ? 1 : 0.75,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = enabled ? '1' : '0.75')}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
