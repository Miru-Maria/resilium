import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './Scene1';
import { Scene2 } from './Scene2';
import { Scene3 } from './Scene3';
import { Scene4 } from './Scene4';
import { Scene5 } from './Scene5';
import { Scene6 } from './Scene6';
import { PersistentElements } from './PersistentElements';
import { AmbientSound } from './AmbientSound';
import { Voiceover } from './Voiceover';

const SCENE_DURATIONS = {
  scene1: 25000,
  scene2: 22000,
  scene3: 42000,
  scene4: 40000,
  scene5: 35000,
  scene6: 25000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });
  const [audioEnabled, setAudioEnabled] = useState(false);

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      <PersistentElements currentScene={currentScene} />

      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene1 key="scene1" />}
        {currentScene === 1 && <Scene2 key="scene2" />}
        {currentScene === 2 && <Scene3 key="scene3" />}
        {currentScene === 3 && <Scene4 key="scene4" />}
        {currentScene === 4 && <Scene5 key="scene5" />}
        {currentScene === 5 && <Scene6 key="scene6" />}
      </AnimatePresence>

      <Voiceover currentScene={currentScene} enabled={audioEnabled} />
      <AmbientSound enabled={audioEnabled} onToggle={() => setAudioEnabled(v => !v)} />
    </div>
  );
}
