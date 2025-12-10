import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, TOTAL_PIECES } from '../constants';
import { PuzzleImage } from '../types';
import { Button } from './Button';
import { Confetti } from './Confetti';

interface PuzzleBoardProps {
  image: PuzzleImage;
  onBack: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ image, onBack }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const touchStartIndex = useRef<number | null>(null);

  // Initialize and shuffle
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const startNewGame = useCallback(() => {
    setIsShuffling(true);
    
    // Create array [0, 1, 2, ... 15]
    const solvedState = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
    let shuffled = [...solvedState];
    
    // Fisher-Yates shuffle - truly random each time
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Ensure it's not solved by accident
    const isAlreadySolved = shuffled.every((val, index) => val === index);
    if (isAlreadySolved) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    setPieces(shuffled);
    setIsSolved(false);
    setMoves(0);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Remove shuffling animation after a brief delay
    setTimeout(() => setIsShuffling(false), 300);
  }, []);

  const swapPieces = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newPieces = [...pieces];
    [newPieces[fromIndex], newPieces[toIndex]] = [newPieces[toIndex], newPieces[fromIndex]];
    
    setPieces(newPieces);
    setMoves(m => m + 1);

    // Check win condition
    const isNowSolved = newPieces.every((val, i) => val === i);
    if (isNowSolved) {
      setIsSolved(true);
    }
  };

  // Desktop drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isSolved) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isSolved || draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (isSolved || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    swapPieces(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mobile/Tablet touch support - hold and drag to swap
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (isSolved) return;
    e.preventDefault();
    touchStartIndex.current = index;
    setDraggedIndex(index);
  };

  // Get index from touch position
  const getIndexFromTouch = (touch: Touch): number | null => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    
    const col = Math.floor((x / rect.width) * GRID_SIZE);
    const row = Math.floor((y / rect.height) * GRID_SIZE);
    
    return row * GRID_SIZE + col;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSolved || draggedIndex === null) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const overIndex = getIndexFromTouch(touch);
    setDragOverIndex(overIndex);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSolved || draggedIndex === null) return;
    e.preventDefault();
    
    // If we have a valid drop target, swap the pieces
    if (dragOverIndex !== null && dragOverIndex !== draggedIndex) {
      swapPieces(draggedIndex, dragOverIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    touchStartIndex.current = null;
  };

  const getPieceStyle = (correctIndex: number) => {
    const row = Math.floor(correctIndex / GRID_SIZE);
    const col = correctIndex % GRID_SIZE;
    
    // 5 pieces means each is 20% ? No.
    // background-size: 500% 500% means the image is 5x larger than the cell.
    // background-position: 
    // x = (col / (GRID_SIZE - 1)) * 100%
    // y = (row / (GRID_SIZE - 1)) * 100%
    
    const x = (col / (GRID_SIZE - 1)) * 100;
    const y = (row / (GRID_SIZE - 1)) * 100;

    return {
      backgroundImage: `url(${image.url})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
      backgroundColor: image.bgColor, // Fill transparency gaps
    };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 pb-8 animate-fade-in">
      {isSolved && <Confetti />}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full mb-6 gap-4">
        <Button onClick={onBack} variant="secondary" size="sm">
          ← Back to Menu
        </Button>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide uppercase">{image.name}</h2>
          <p className="text-red-500 font-bold tracking-widest">MOVES: {moves}</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setShowHint(!showHint)} variant="primary" size="sm">
             {showHint ? 'Hide Hint' : 'Show Hint'}
           </Button>
           <Button onClick={startNewGame} variant="danger" size="sm">
             Restart
           </Button>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative w-full max-w-[500px] aspect-square p-2 rounded-xl shadow-xl border-2 border-gray-200 bg-white"
        style={{ backgroundColor: image.bgColor }}
      >
        
        {/* Hint Layer (Behind pieces) */}
        {showHint && (
           <div 
            className="absolute inset-2 z-0 opacity-40 pointer-events-none rounded-lg overflow-hidden"
            style={{
              backgroundImage: `url(${image.url})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center'
            }}
           />
        )}

        {/* Victory Overlay */}
        {isSolved && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 rounded-lg backdrop-blur-md animate-fade-in border border-red-500/30">
            <h3 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider uppercase">
              Unit Complete
            </h3>
            <p className="text-red-500 text-xl mb-6 tracking-widest">{moves} MOVES</p>
            <Button onClick={onBack} size="lg">
              Select Next Unit
            </Button>
          </div>
        )}

        {/* The Grid */}
        <div 
          ref={gridRef}
          className={`grid grid-cols-4 gap-1 w-full h-full relative z-10 transition-all duration-300 ${isShuffling ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {pieces.map((correctIndex, currentSlotIndex) => {
            const isDragging = draggedIndex === currentSlotIndex;
            const isDragOver = dragOverIndex === currentSlotIndex;
            const isCorrectPosition = correctIndex === currentSlotIndex;

            return (
              <div
                key={currentSlotIndex}
                draggable={!isSolved && !isShuffling}
                onDragStart={(e) => handleDragStart(e, currentSlotIndex)}
                onDragOver={(e) => handleDragOver(e, currentSlotIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, currentSlotIndex)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, currentSlotIndex)}
                className={`
                  relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden rounded-sm transition-all duration-200 select-none touch-none
                  ${isDragging ? 'ring-4 ring-yellow-400 scale-105 shadow-xl z-20' : ''}
                  ${isDragOver && !isDragging ? 'ring-4 ring-amber-400 brightness-110' : ''}
                  ${isSolved ? 'cursor-default' : 'hover:brightness-110'}
                  ${!isSolved && isCorrectPosition && !isDragging ? 'ring-1 ring-green-400' : ''}
                  ${isShuffling ? 'animate-pulse' : ''}
                `}
              >
                {/* The Image Slice */}
                <div 
                  className="w-full h-full pointer-events-none"
                  style={getPieceStyle(correctIndex)}
                />
                
                {/* Checkmark for correct position (optional visual feedback) */}
                {!isSolved && isCorrectPosition && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full shadow-md" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <p className="mt-6 text-gray-500 text-center text-sm font-medium bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 tracking-wide">
        Hold + Slide to swap units
      </p>
    </div>
  );
};