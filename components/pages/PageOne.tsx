import React from 'react';
import MiddleScroller from '../MiddleScroller';
import { PuzzleMenu } from '../PuzzleMenu';
import { PuzzleImage } from '../../types';

interface PageOneProps {
  onSelect?: (img: PuzzleImage) => void;
}

export const PageOne: React.FC<PageOneProps> = ({ onSelect }) => {
  return (
    <MiddleScroller>
      <div className="w-full">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Orbitron, sans-serif' }}>Puza Labubu — Explore</h2>
          <p className="text-sm text-gray-600">Browse puzzles, select to try, or collect the full set.</p>
        </div>
        <PuzzleMenu onSelect={(img) => onSelect && onSelect(img)} />
      </div>
    </MiddleScroller>
  );
};

export default PageOne;
