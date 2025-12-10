import React, { useState } from 'react';
import { PuzzleMenu } from './components/PuzzleMenu';
import { PuzzleBoard } from './components/PuzzleBoard';
import { Flyers } from './components/Flyers';
import { PuzzleImage } from './types';

type View = 'menu' | 'puzzle' | 'flyers';

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

  return (
    <div className="min-h-screen flex flex-col items-center bg-white">
      {/* Header / Title Bar - PopMart Style */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-24"></div>
          <div 
            className="px-5 py-2.5 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: '#b91c1c' }}
            onClick={handleBack}
          >
            <h1 
              className="text-xl md:text-2xl font-black text-white tracking-wider uppercase" 
              style={{ fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.15em' }}
            >
              PuzLabu
            </h1>
          </div>
          <button
            onClick={() => setCurrentView('flyers')}
            className="text-xs md:text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all tracking-wider uppercase font-semibold"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Flyers
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 flex flex-col justify-start pt-8">
        {currentView === 'puzzle' && activePuzzle ? (
          <PuzzleBoard 
            image={activePuzzle} 
            onBack={handleBack} 
          />
        ) : currentView === 'flyers' ? (
          <Flyers onBack={handleBack} />
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
  );
}

export default App;