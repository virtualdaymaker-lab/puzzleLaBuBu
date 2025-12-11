import React, { useState } from 'react';
import { ActivationGate } from './components/ActivationGate';
import { PUZZLE_IMAGES } from './constants';
import { PuzzleImage } from './types';
import { PuzzleBoard } from './components/PuzzleBoard';
import { PuzzleMenu } from './components/PuzzleMenu';

type View = 'menu' | 'puzzle';

function App() {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleImage | null>(null);
  const [currentView, setCurrentView] = useState<View>('menu');
    const fallbackPrice = 1; // Changed from 20 to 1 dollar

  const handleSelectPuzzle = (img: PuzzleImage) => {
    setActivePuzzle(img);
    setCurrentView('puzzle');
  };

  const handleBack = () => {
    setActivePuzzle(null);
    setCurrentView('menu');
  };

  // Dev-only: allow a quick navigator via localStorage for development
  React.useEffect(() => {
    try {
      const devNav = localStorage.getItem('puzlabu_dev_nav');
      if (!devNav) return;
      if (devNav === 'menu') {
        setActivePuzzle(null);
        setCurrentView('menu');
      } else if (devNav.startsWith('puzzle:')) {
        const id = devNav.split(':')[1];
        const img = PUZZLE_IMAGES.find(i => i.id === id) || PUZZLE_IMAGES[0];
        setActivePuzzle(img);
        setCurrentView('puzzle');
      }
      // Clear after use
      localStorage.removeItem('puzlabu_dev_nav');
    } catch (e) {
      // no-op
    }
  }, []);

  // Listen for dev nav events emitted by the ActivationGate (dev-only)
  React.useEffect(() => {
    const handler = () => {
      try {
        const devNav = localStorage.getItem('puzlabu_dev_nav');
        if (!devNav) return;
        if (devNav === 'menu') {
          setActivePuzzle(null);
          setCurrentView('menu');
        } else if (devNav.startsWith('puzzle:')) {
          const id = devNav.split(':')[1];
          const img = PUZZLE_IMAGES.find(i => i.id === id) || PUZZLE_IMAGES[0];
          setActivePuzzle(img);
          setCurrentView('puzzle');
        }
        localStorage.removeItem('puzlabu_dev_nav');
      } catch (e) {
        // no-op
      }
    };

    window.addEventListener('puzlabu:dev-nav', handler);
    return () => window.removeEventListener('puzlabu:dev-nav', handler);
  }, []);

  // Always show ActivationGate only, never puzzles directly
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  return (
    <ActivationGate>
      <div className="min-h-screen flex flex-col items-center bg-white">
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
            <div 
              className="px-5 py-2.5 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#b91c1c' }}
              onClick={() => handleBack()}
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
        {/* Main Content Area: Show puzzles and menu, ActivationGate will handle blocking if not activated */}
        <main className="flex-1 w-full p-4 flex flex-col justify-start pt-8">
          {currentView === 'puzzle' && activePuzzle ? (
            <PuzzleBoard 
              image={activePuzzle} 
              onBack={handleBack} 
            />
          ) : (
            <PuzzleMenu 
              onSelect={handleSelectPuzzle} 
            />
          )}
        </main>
        {/* Temporary navigation arrows at the bottom (dev only) */}
        {isDevMode && (
          <div className="fixed bottom-3 left-0 w-full flex justify-center items-center pointer-events-auto z-50">
          <button
            className="mx-2 p-1 bg-gray-100 rounded-full shadow text-xs text-gray-500 hover:bg-gray-200"
            style={{ width: 28, height: 28 }}
            aria-label="Go to menu"
            onClick={() => setCurrentView('menu')}
            disabled={currentView === 'menu'}
          >
            <span style={{ fontSize: '1.2em' }}>&larr;</span>
          </button>
          <button
            className="mx-2 p-1 bg-gray-100 rounded-full shadow text-xs text-gray-500 hover:bg-gray-200"
            style={{ width: 28, height: 28 }}
            aria-label="Go to puzzle"
            onClick={() => {
              if (PUZZLE_IMAGES.length > 0) {
                setActivePuzzle(PUZZLE_IMAGES[0]);
                setCurrentView('puzzle');
              }
            }}
            disabled={currentView === 'puzzle'}
          >
            <span style={{ fontSize: '1.2em' }}>&rarr;</span>
          </button>
          </div>
        )}
        <footer className="w-full text-center py-6 text-gray-400 font-medium text-sm tracking-widest uppercase">
          <p className="text-gray-300">Collect All Units</p>
        </footer>
      </div>
    </ActivationGate>
  );
}

export default App;