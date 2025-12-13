import React from 'react';
import MiddleScroller from '../MiddleScroller';
import { PUZZLE_IMAGES } from '../../constants';

const PageTwo: React.FC = () => {
  return (
    <MiddleScroller>
      <div className="w-full">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Orbitron, sans-serif' }}>Puza Labubu — Demo Previews</h2>
          <p className="text-sm text-gray-600">Scroll the previews below and try highlighted puzzles.</p>
        </div>

        <div className="flex flex-col gap-4">
          {PUZZLE_IMAGES.slice(0, 10).map((img, idx) => (
            <div key={img.id} className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center text-center">
              <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: 220 }}>
                <img src={img.url} alt={img.name} className="mx-auto max-h-[56vh] w-auto object-contain" />
              </div>
              <div className="w-full">
                <div className="text-xl font-semibold text-gray-800">{img.name}</div>
                <div className="text-sm text-gray-600 mt-1 mb-3">{idx === 0 ? '⭐ Limited Edition: Unique puzzle.' : idx === 1 ? '⭐ Limited Edition: Special puzzle.' : 'Classic puzzle challenge.'}</div>
                <div className="mt-2">
                  {img.id === 'puzalabubu' ? (
                    <button onClick={() => { try { (window as any).setPuzView && (window as any).setPuzView('puzzle', img.id); } catch {} }} className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700">Try Puzzle</button>
                  ) : (
                    <button onClick={() => { try { (window as any).setPuzView && (window as any).setPuzView('puzzle', img.id); } catch {} }} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200">Open</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MiddleScroller>
  );
};

export default PageTwo;
