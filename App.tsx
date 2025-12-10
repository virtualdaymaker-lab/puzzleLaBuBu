import React, { useState } from 'react';
import { PuzzleMenu } from './components/PuzzleMenu';
import { PuzzleBoard } from './components/PuzzleBoard';
import { ActivationGate } from './components/ActivationGate';
import { PUZZLE_IMAGES } from './constants';
import { PuzzleImage } from './types';

type View = 'menu' | 'puzzle';

function App() {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleImage | null>(null);
  const [currentView, setCurrentView] = useState<View>('menu');

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

  return (
    <ActivationGate>
      <div className="min-h-screen flex flex-col items-center bg-white">
        {/* Header / Title Bar */}
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
            {/* Logo */}
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

        {/* Main Content Area */}
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

        {/* Footer */}
        <footer className="w-full text-center py-6 text-gray-400 font-medium text-sm tracking-widest uppercase">
          <p className="text-gray-300">Collect All Units</p>
        </footer>
      </div>
    </ActivationGate>
  );
}

export default App;