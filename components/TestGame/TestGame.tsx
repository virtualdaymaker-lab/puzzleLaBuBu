import React, { useEffect, useMemo, useState } from 'react';

type Card = {
  id: string;
  value: string;
  matched: boolean;
};

const DEFAULT_VALUES = ['🍎','🍌','🍇','🍓','🍍','🥝'];

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GameBoard: React.FC<{ size?: number; onWin?: (moves: number, seconds: number) => void }> = ({ size = 6, onWin }) => {
  const pairValues = useMemo(() => DEFAULT_VALUES.slice(0, size), [size]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const doubled = pairValues.flatMap((v, i) => [ { id: `${i}-a`, value: v, matched: false }, { id: `${i}-b`, value: v, matched: false }]);
    setCards(shuffle(doubled));
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  }, [pairValues]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setRunning(false);
      onWin && onWin(moves, seconds);
    }
  }, [cards, moves, seconds, onWin]);

  const handleFlip = (id: string) => {
    if (flipped.includes(id)) return;
    if (flipped.length === 2) return;
    if (!running) setRunning(true);
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next;
      const cardA = cards.find(c => c.id === a)!;
      const cardB = cards.find(c => c.id === b)!;
      if (cardA.value === cardB.value) {
        setTimeout(() => {
          setCards(prev => prev.map(c => c.value === cardA.value ? { ...c, matched: true } : c));
          setFlipped([]);
        }, 300);
      } else {
        setTimeout(() => setFlipped([]), 600);
      }
    }
  };

  const reset = () => {
    const doubled = pairValues.flatMap((v, i) => [ { id: `${i}-a`, value: v, matched: false }, { id: `${i}-b`, value: v, matched: false }]);
    setCards(shuffle(doubled));
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">Moves: <strong className="text-gray-800">{moves}</strong></div>
        <div className="text-sm text-gray-600">Time: <strong className="text-gray-800">{seconds}s</strong></div>
        <div>
          <button onClick={reset} className="px-3 py-1 rounded bg-gray-100 border">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          return (
            <button key={card.id} onClick={() => handleFlip(card.id)} disabled={isFlipped} className={`h-28 rounded-lg shadow flex items-center justify-center text-2xl ${isFlipped ? 'bg-white' : 'bg-gray-100'}`}>
              {isFlipped ? card.value : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TestGame: React.FC = () => {
  const [page, setPage] = useState<'play'|'about'>('play');
  const [best, setBest] = useState<{moves:number,seconds:number} | null>(null);

  const handleWin = (moves:number, seconds:number) => {
    const prev = best;
    if (!prev || moves < prev.moves || (moves === prev.moves && seconds < prev.seconds)) {
      setBest({ moves, seconds });
    }
    // auto-switch to about page to show stats
    setTimeout(() => setPage('about'), 700);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Test — Memory Match</h2>
        <div className="flex gap-2">
          <button onClick={() => setPage('play')} className={`px-3 py-1 rounded ${page==='play' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>Play</button>
          <button onClick={() => setPage('about')} className={`px-3 py-1 rounded ${page==='about' ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>Stats</button>
        </div>
      </div>

      {page === 'play' ? (
        <GameBoard onWin={handleWin} />
      ) : (
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-2">About this puzzle</h3>
          <p className="text-sm text-gray-600 mb-4">This is a compact memory match game implemented for quick testing. Flip cards to find pairs. Try to finish in the fewest moves and shortest time.</p>
          <div className="text-sm">
            <div>Best result:</div>
            {best ? (
              <div className="mt-2 text-gray-800">Moves: <strong>{best.moves}</strong> — Time: <strong>{best.seconds}s</strong></div>
            ) : (
              <div className="mt-2 text-gray-500">No results yet — play to record a best score.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestGame;
