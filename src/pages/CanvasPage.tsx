import { useEffect, useState } from 'react';
import { InfiniteCanvas } from '../components/canvas/InfiniteCanvas';
import { OnboardingModal } from '../components/layout/OnboardingModal';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { SplashScreen } from '../components/ui/SplashScreen';

export function CanvasPage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <main className="app-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <Sidebar />
        <section className="workspace">
          <Topbar />
          <InfiniteCanvas />
        </section>
        <OnboardingModal />
      </main>
    </>
  );
}
