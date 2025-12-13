import React, { useState } from 'react';
import { PUZZLE_IMAGES } from '../constants';
import { PuzzleImage } from '../types';
import { PayPalCheckout } from './PayPalCheckout';

interface PuzzleMenuProps {
  onSelect: (image: PuzzleImage) => void;
}

export const PuzzleMenu: React.FC<PuzzleMenuProps> = ({ onSelect }) => {
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());
  const [showCollectCheckout, setShowCollectCheckout] = useState(false);
  const [collectEmail, setCollectEmail] = useState('');
  const [showCollectPayPal, setShowCollectPayPal] = useState(false);

  const handleImageError = (id: string) => {
    setLoadErrors(prev => new Set(prev).add(id));
  };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-4xl mx-auto p-6 animate-fade-in">
      <h1 className="text-3xl md:text-4xl text-gray-900 font-bold mb-2 text-center tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        Puza Labubu
      </h1>
      <h2 className="text-xl md:text-2xl text-gray-800 font-semibold mb-6 text-center">Select Unit</h2>

      <div className="w-full max-w-3xl mx-auto">
        <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
        <div className="hide-scrollbar overflow-y-auto" style={{ maxHeight: '72vh', padding: '8px 4px' }}>
          <div className="flex flex-col gap-6 items-center">
            {PUZZLE_IMAGES.map((img) => (
              <div key={img.id} className="bg-white rounded-xl p-6 shadow border border-gray-100 w-full max-w-xl flex flex-col items-center text-center">
                <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: 220 }}>
                  {loadErrors.has(img.id) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-2">
                      <span className="text-5xl font-bold">?</span>
                    </div>
                  ) : (
                    <img
                      src={img.url}
                      alt={img.name}
                      className="mx-auto max-h-[56vh] w-auto object-contain"
                      loading="lazy"
                      onError={() => handleImageError(img.id)}
                    />
                  )}
                </div>

                <div className="w-full">
                  <div className="text-2xl font-bold text-gray-800">{img.name}</div>
                  <div className="text-2xl font-bold text-gray-800">{img.name}</div>
                  <div className="text-2xl font-bold text-gray-800">{img.name}</div>
                  <div className="text-sm text-gray-600 mt-1 mb-3">{img.color ? `${img.color} puzzle` : 'Puzzle'}</div>
                  <div className="mt-2 flex justify-center">
                    <button onClick={() => onSelect(img)} className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700">Select</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Demo card (styled like other units) using last puzzle image data */}
            {(() => {
              const demo = PUZZLE_IMAGES[PUZZLE_IMAGES.length - 1];
              return (
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100 w-full max-w-xl flex flex-col items-center text-center">
                  <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: 220 }}>
                    <img src={demo?.url} alt={demo?.name} className="mx-auto max-h-[56vh] w-auto object-contain" />
                  </div>
                  <div className="w-full">
                    <div className="text-2xl font-bold text-gray-800">{demo?.name}</div>
                    <div className="text-2xl font-bold text-gray-800">{demo?.name}</div>
                    <div className="text-2xl font-bold text-gray-800">{demo?.name}</div>
                    <div className="text-sm text-gray-600 mt-1 mb-3">{demo?.color ? `${demo.color} puzzle` : 'puzzle'}</div>
                    <div className="mt-2 flex justify-center">
                      <button onClick={() => { setTimeout(() => { try { (window as any).dispatchEvent && (window as any).dispatchEvent(new CustomEvent('puzlabu-nav', { detail: { action: 'showDemo' } })); } catch {} }, 0); }} className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700">Select</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom action: Collect All Units */}
            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              <div>
                <button onClick={() => setShowCollectCheckout(true)} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200">Collect All Units</button>
              </div>

              {showCollectCheckout && (
                <div className="mt-4 w-full max-w-xl bg-white p-4 border border-gray-100 rounded-md shadow-sm">
                  <div className="hide-scrollbar overflow-y-auto" style={{ maxHeight: '60vh', paddingRight: 8 }}>
                    <div className="flex flex-col gap-4">
                      <h2 className="text-2xl font-bold">Unlock All Puzzles</h2>
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input value={collectEmail} onChange={(e) => setCollectEmail(e.target.value)} className="block w-full border border-gray-200 rounded-md p-2" placeholder="your@email.com" type="email" />

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <div className="text-lg font-semibold">6 Puzzles</div>
                          <div className="text-sm text-gray-600">Includes 2 Limited Edition puzzles</div>
                        </div>
                        <div className="text-2xl font-bold">$1.00</div>
                      </div>

                      <div className="text-sm text-red-600">⚠️ Final Sale - No Refunds</div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setShowCollectPayPal(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
                        >
                          Continue to Payment
                        </button>
                        <button onClick={() => { setShowCollectCheckout(false); setShowCollectPayPal(false); }} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200">Cancel</button>
                      </div>

                      {showCollectPayPal && (
                        <div className="mt-4">
                          <PayPalCheckout
                            onSuccess={() => {
                              setShowCollectPayPal(false);
                              setShowCollectCheckout(false);
                              try { (window as any).dispatchEvent && (window as any).dispatchEvent(new CustomEvent('puzlabu-nav', { detail: { action: 'showCodes' } })); } catch {}
                            }}
                            onCancel={() => setShowCollectPayPal(false)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};