import { useEffect, useRef } from 'react';

const NARRATIONS: Record<number, string[]> = {
  0: [
    "Most people aren't prepared for disruption.",
    "Economic shocks. Job loss. Health crises.",
    "Resilium changes that.",
  ],
  1: [
    "Resilium builds a three-sixty profile of your personal resilience.",
    "Six weighted dimensions — Financial, Health, Skills, Mobility, Psychological strength, and Resources.",
    "Together, they tell the full story.",
  ],
  2: [
    "The assessment takes about ten minutes.",
    "Questions about your income, savings, location, health, skills, housing, and risk concerns.",
    "Ten dimensions. Ten minutes.",
  ],
  3: [
    "Your answers are scored across six weighted categories.",
    "The result is a resilience score out of a hundred — plus a personalized AI-written risk profile.",
    "Uniquely tailored to you.",
  ],
  4: [
    "Your report includes a prioritized action checklist — sorted by your weakest areas first.",
    "Then a strategic plan across three time horizons: thirty days, ninety days, and twelve months.",
    "Concrete steps. Real progress.",
  ],
  5: [
    "Know your vulnerabilities.",
    "Build your plan.",
    "Be ready for whatever comes next.",
    "Resilium.",
  ],
};

interface VoiceoverProps {
  currentScene: number;
  enabled: boolean;
}

export function Voiceover({ currentScene, enabled }: VoiceoverProps) {
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Cancel any ongoing speech and timers
    window.speechSynthesis?.cancel();
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    utterancesRef.current = [];

    if (!enabled || !window.speechSynthesis) return;

    const lines = NARRATIONS[currentScene] ?? [];
    let cumulativeDelay = 1200;

    lines.forEach((line) => {
      const t = setTimeout(() => {
        if (!window.speechSynthesis) return;
        const u = new SpeechSynthesisUtterance(line);
        u.rate = 0.88;
        u.pitch = 0.95;
        u.volume = 0.95;

        // Prefer a natural-sounding English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferred) u.voice = preferred;

        utterancesRef.current.push(u);
        window.speechSynthesis.speak(u);
      }, cumulativeDelay);

      timersRef.current.push(t);
      // Estimate reading time: ~130 words/min at rate 0.88, ~5 chars/word
      const wordCount = line.split(' ').length;
      const speakDuration = (wordCount / 130) * 60 * 1000 / 0.88;
      cumulativeDelay += speakDuration + 600; // gap between lines
    });

    return () => {
      window.speechSynthesis?.cancel();
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [currentScene, enabled]);

  return null;
}
