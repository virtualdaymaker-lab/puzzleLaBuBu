import React, { useState } from 'react';
import { PUZZLE_IMAGES } from '../constants';
import { PuzzleImage } from '../types';

interface PuzzleMenuProps {
  onSelect: (image: PuzzleImage) => void;
}

export const PuzzleMenu: React.FC<PuzzleMenuProps> = ({ onSelect }) => {
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setLoadErrors(prev => new Set(prev).add(id));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <h2 className="text-2xl md:text-3xl text-gray-800 font-bold mb-8 text-center tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
        Select Unit
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 w-full">
        {PUZZLE_IMAGES.map((img) => (
          <button
            key={img.id}
            onClick={() => onSelect(img)}
            className="card-beam group relative flex flex-col items-center bg-red-500 p-3 md:p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div 
              className="relative w-full aspect-square overflow-hidden rounded-lg mb-2 md:mb-4 z-10"
              style={{ backgroundColor: img.bgColor }}
            >
              {loadErrors.has(img.id) ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-2">
                  <span className="text-3xl md:text-4xl mb-2 font-bold">?</span>
                  <span className="text-xs text-center font-medium tracking-wider">MISSING</span>
                </div>
              ) : (
                <img 
                  src={img.url} 
                  alt={img.name} 
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={() => handleImageError(img.id)}
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>
            
            <span className="text-sm md:text-base font-bold text-white group-hover:text-white/90 transition-colors text-center leading-tight tracking-wide uppercase z-10">
              {img.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};