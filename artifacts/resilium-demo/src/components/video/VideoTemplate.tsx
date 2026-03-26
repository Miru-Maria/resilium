import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { HexagonGrid } from './HexagonGrid';
import { GlowingRing } from './GlowingRing';
import { Scene1Hook } from './Scene1Hook';
import { Scene2Product } from './Scene2Product';
import { Scene3Assessment } from './Scene3Assessment';
import { Scene4Report } from './Scene4Report';
import { Scene5Profile } from './Scene5Profile';
import { Scene6Close } from './Scene6Close';

const SCENE_DURATIONS = {
  hook: 5500,
  product: 4500,
  assessment: 6000,
  report: 7000,
  profile: 5500,
  close: 5000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({
    durations: SCENE_DURATIONS,
  });

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div 
        className="w-full relative overflow-hidden bg-[var(--color-bg-dark)] shadow-2xl @container"
        style={{ aspectRatio: '16/9', maxHeight: '100vh', maxWidth: 'calc(100vh * 16 / 9)' }}
      >
        {/* Persistent Background Elements */}
        <HexagonGrid />
        <GlowingRing currentScene={currentScene} />

        {/* Scene Content */}
        <AnimatePresence mode="wait">
          {currentScene === 0 && <Scene1Hook key="hook" />}
          {currentScene === 1 && <Scene2Product key="product" />}
          {currentScene === 2 && <Scene3Assessment key="assessment" />}
          {currentScene === 3 && <Scene4Report key="report" />}
          {currentScene === 4 && <Scene5Profile key="profile" />}
          {currentScene === 5 && <Scene6Close key="close" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
