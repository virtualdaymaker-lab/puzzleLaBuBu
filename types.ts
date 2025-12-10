export interface PuzzleImage {
  id: string;
  url: string;
  name: string;
  color: string; // Tailwind color class for borders/accents
  bgColor: string; // Background color to fill transparency gaps
}

export interface PuzzleState {
  currentPositions: number[]; // Array of size 25, value at index i is the 'correct' piece index
  isSolved: boolean;
  moveCount: number;
}