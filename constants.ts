import { PuzzleImage } from './types';
// Import images so Vite bundles/copies them into `dist` during build.
import lpbb1 from './images/PuzLabu/lpbb1.png';
import lpbb2 from './images/PuzLabu/lpbb2.png';
import lbpp3 from './images/PuzLabu/lbpp3.png';
import lpbb8 from './images/PuzLabu/lpbb8.png';
import lpbb12 from './images/PuzLabu/lpbb12.png';
// 6th puzzle image
import puzalabubu from './images/PuzLabu/1.png';

export const GRID_SIZE = 4;
export const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

export const PUZZLE_IMAGES: PuzzleImage[] = [
  {
    id: 'lpbb1',
    name: '⭐ Limited Edition 1',
    url: lpbb1,
    color: 'purple',
    bgColor: '#f5f0ff',
  },
  {
    id: 'lpbb2',
    name: 'Puzzle Stock 2',
    url: lpbb2,
    color: 'red',
    bgColor: '#fff5f5',
  },
  {
    id: 'lbpp3',
    name: 'Puzzle Stock 3',
    url: lbpp3,
    color: 'amber',
    bgColor: '#fffbeb',
  },
  {
    id: 'lpbb8',
    name: 'Puzzle Stock 8',
    url: lpbb8,
    color: 'yellow',
    bgColor: '#fffde7',
  },
  {
    id: 'lpbb12',
    name: '⭐ Limited Edition 12',
    url: lpbb12,
    color: 'amber',
    bgColor: '#efebe9',
  },
  {
    id: 'puzalabubu',
    name: 'Puza Labubu',
    url: puzalabubu,
    color: 'red',
    bgColor: '#fee2e2',
  },
];
