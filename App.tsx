import React, { useState } from 'react';
import { ActivationGate } from './components/ActivationGate';
import { PUZZLE_IMAGES } from './constants';
import { PuzzleImage } from './types';
import { PuzzleBoard } from './components/PuzzleBoard';
import { PuzzleMenu } from './components/PuzzleMenu';
import PageOne from './components/pages/PageOne';
import PageTwo from './components/pages/PageTwo';
import TestGame from './components/TestGame/TestGame';
import SideNav from './components/SideNav';

type View = 'page1' | 'page2' | 'menu' | 'puzzle' | 'testgame';

function App() {
  // App state: menu or puzzle
  const [activePuzzle, setActivePuzzle] = useState<PuzzleImage | null>(null);
  const [currentView, setCurrentView] = useState<View>('testgame');

  const handleSelectPuzzle = (img: PuzzleImage) => {
    setActivePuzzle(img);
    setCurrentView('puzzle');
  };

  const handleBack = () => {
    setActivePuzzle(null);
    setCurrentView('menu');
  };

  // Expose a global debug API so debug toolbar can switch views even when ActivationGate
  // has bypassed activation. Use `window.setPuzView(view, puzzleId?)` or dispatch
  // a CustomEvent `puzlabu-debug` with { action: 'setView', view, puzzleId }.
  React.useEffect(() => {
    (window as any).setPuzView = (view: View, puzzleId?: string | null) => {
      if (view === 'testgame') {
        setActivePuzzle(null);
        setCurrentView('testgame');
        return;
      }
      if (view === 'page1') {
        setActivePuzzle(null);
        setCurrentView('page1');
      } else if (view === 'page2') {
        setActivePuzzle(null);
        setCurrentView('page2');
      } else if (view === 'menu') {
        setActivePuzzle(null);
        setCurrentView('menu');
      } else if (view === 'puzzle') {
        if (puzzleId) {
          const img = PUZZLE_IMAGES.find(i => i.id === puzzleId) || PUZZLE_IMAGES[0] || null;
          setActivePuzzle(img as any);
        }
        setCurrentView('puzzle');
      }
    };

    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail || {};
        if (detail.action === 'setView') {
          const view = detail.view as View;
          const puzzleId = detail.puzzleId as string | undefined;
          (window as any).setPuzView(view, puzzleId);
        }
      } catch (err) {}
    };

    window.addEventListener('puzlabu-debug', handler as EventListener);
    return () => window.removeEventListener('puzlabu-debug', handler as EventListener);
  }, []);




  return (
    <div className="min-h-screen flex flex-row bg-white">
      <SideNav />
      <div className="flex-1 flex flex-col items-center">
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
            <div 
              className="px-5 py-2.5 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#b91c1c' }}
              onClick={() => { try { (window as any).setPuzView && (window as any).setPuzView('testgame'); } catch { setCurrentView('testgame'); } }}
            >
              <h1 
                className="text-xl md:text-2xl font-black text-white tracking-wider" 
                style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.05em' }}
              >
                Puza Labubu
              </h1>
            </div>
          </div>
        </header>
        {/* Main Content Area: Show puzzles and menu. ActivationGate renders overlays but does not block navigation. */}
        <main className="flex-1 w-full p-4 flex flex-col justify-start pt-8">
          {currentView === 'puzzle' && activePuzzle ? (
            <PuzzleBoard 
              image={activePuzzle} 
              onBack={handleBack} 
            />
          ) : currentView === 'page2' ? (
            <PageTwo />
          ) : currentView === 'testgame' ? (
            <TestGame />
          ) : (
            <PageOne onSelect={handleSelectPuzzle} />
          )}
        </main>
        {/* Floating navigation removed (back handled by header) */}
        <footer className="w-full text-center py-6 text-gray-400 font-medium text-sm tracking-widest uppercase">
          <p className="text-gray-300">Collect All Units</p>
        </footer>
      </div>
      <ActivationGate />
    </div>
  );
}

export default App;