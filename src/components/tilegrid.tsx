'use client';

import React from 'react';
import seedrandom from 'seedrandom';

const tileTypes = {
  'board-up-left': (
    <svg key="1" viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="0,0 100,100 0,100" fill="currentColor" />
    </svg>
  ),
  'board-down-right': (
    <svg key="2" viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="0,0 100,100 100,0" fill="currentColor" />
    </svg>
  ),
  'board-down-left': (
    <svg key="3" viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="0,0 100,0 0,100" fill="currentColor" />
    </svg>
  ),
  'board-up-right': (
    <svg key="4" viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="100,0 100,100 0,100" fill="currentColor" />
    </svg>
  ),
  'blank': (
    <svg key="5" viewBox="0 0 100 100" className="w-full h-full">
    </svg>
  ),
  'board': (
    <svg key="6" viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="currentColor" />
    </svg>
  ),
};

interface Segment {
  length: number;
  type: 'board' | 'space';
  start?: 'left' | 'right';
  end?: 'left' | 'right';
}

interface Column {
  index: number;
  columnType: string;
  segments: Segment[];
  tiles: string[];
}

const columnTypes = [
  'board-space',
  'space-board',
  'board-space-board',
  'space-board-space',
  'board-space-board-space',
  'space-board-space-board',
  'board-space-board-space-board',
];

// function createSegment(rng: seedrandom.PRNG, segments): Segment {
//   return {
//     length,
//     type,
//     start: Math.floor(rng()) === 0 ? 'left' : 'right',
//     end: Math.floor(rng()) === 0 ? 'left' : 'right',
//   };
// }

function getColumn(rng: seedrandom.PRNG, index: number, cells: number): Column {
  const columnType = columnTypes[Math.floor(rng() * columnTypes.length)];
  const segments: Segment[] = [];

  // randomly pick segment lengths
  if (columnType === 'board-space' || columnType === 'space-board') {
    // 2 segments
    if (columnType === 'board-space') {
      const firstSegmentCells = Math.floor(rng() * (cells - 5)) + 4; // At least 4 cells for board
      const secondSegmentCells = cells - firstSegmentCells;
      segments.push({ length: firstSegmentCells, type: 'board', end: Math.round(rng()) === 0 ? 'left' : 'right' });
      segments.push({ length: secondSegmentCells, type: 'space' });
    } else {
      const firstSegmentCells = Math.floor(rng() * (cells - 4)) + 1; // Space can be 1 cell
      const secondSegmentCells = cells - firstSegmentCells;
      segments.push({ length: firstSegmentCells, type: 'space' });
      segments.push({ length: secondSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right' });
    }
  } else if (columnType === 'board-space-board' || columnType === 'space-board-space') {
    // 3 segments
    if (columnType === 'board-space-board') {
      const firstSegmentCells = Math.floor(rng() * (cells - 9)) + 4; // At least 4 cells for first board
      const remainingCells = cells - firstSegmentCells;
      const secondSegmentCells = Math.floor(rng() * (remainingCells - 4)) + 1; // Space can be 1
      const thirdSegmentCells = remainingCells - secondSegmentCells; // At least 4 cells left for last board
      segments.push({ length: firstSegmentCells, type: 'board', end: Math.round(rng()) === 0 ? 'left' : 'right' });
      segments.push({ length: secondSegmentCells, type: 'space' });
      segments.push({ length: thirdSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right' });
    } else {
      const firstSegmentCells = Math.floor(rng() * (cells - 5)) + 1; // Space can be 1
      const remainingCells = cells - firstSegmentCells;
      const secondSegmentCells = Math.floor(rng() * (remainingCells - 1)) + 4; // At least 4 for board
      const thirdSegmentCells = remainingCells - secondSegmentCells;
      segments.push({ length: firstSegmentCells, type: 'space' });
      segments.push({ length: secondSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right', end: Math.round(rng()) === 0 ? 'left' : 'right' });
      segments.push({ length: thirdSegmentCells, type: 'space' });
    }
  } else if (columnType === 'board-space-board-space' || columnType === 'space-board-space-board') {
    // 4 segments
    if (columnType === 'board-space-board-space') {
      const firstSegmentCells = Math.floor(rng() * (cells - 11)) + 4; // At least 4 for first board
      const remainingCells1 = cells - firstSegmentCells;
      const secondSegmentCells = Math.floor(rng() * (remainingCells1 - 5)) + 1; // Space can be 1
      const remainingCells2 = remainingCells1 - secondSegmentCells;
      const thirdSegmentCells = Math.floor(rng() * (remainingCells2 - 1)) + 4; // At least 4 for second board
      const fourthSegmentCells = remainingCells2 - thirdSegmentCells;
      segments.push({ length: firstSegmentCells, type: 'board', end: Math.round(rng()) === 0 ? 'left' : 'right' });
      segments.push({ length: secondSegmentCells, type: 'space' });
      segments.push({ length: thirdSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right', end: Math.round(rng()) === 0 ? 'left' : 'right' });
      segments.push({ length: fourthSegmentCells, type: 'space' });
    } else {
      const firstSegmentCells = Math.floor(rng() * (cells - 9)) + 1; // Space can be 1
      const remainingCells1 = cells - firstSegmentCells;
      const secondSegmentCells = Math.floor(rng() * (remainingCells1 - 6)) + 4; // At least 4 for first board
      const remainingCells2 = remainingCells1 - secondSegmentCells;
      const thirdSegmentCells = Math.floor(rng() * (remainingCells2 - 4)) + 1; // Space can be 1
      const fourthSegmentCells = remainingCells2 - thirdSegmentCells; // At least 4 left for last board
      segments.push({ length: firstSegmentCells, type: 'space' });
      segments.push({ length: secondSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right', end: Math.round(rng()) === 0 ? 'left' : 'right' });
      segments.push({ length: thirdSegmentCells, type: 'space' });
      segments.push({ length: fourthSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right' });
    }
  } else if (columnType === 'board-space-board-space-board') {
    // 5 segments
    const firstSegmentCells = Math.floor(rng() * (cells - 15)) + 4; // At least 4 for first board
    const remainingCells1 = cells - firstSegmentCells;
    const secondSegmentCells = Math.floor(rng() * (remainingCells1 - 9)) + 1; // Space can be 1
    const remainingCells2 = remainingCells1 - secondSegmentCells;
    const thirdSegmentCells = Math.floor(rng() * (remainingCells2 - 5)) + 4; // At least 4 for second board
    const remainingCells3 = remainingCells2 - thirdSegmentCells;
    const fourthSegmentCells = Math.floor(rng() * (remainingCells3 - 4)) + 1; // Space can be 1
    const fifthSegmentCells = remainingCells3 - fourthSegmentCells; // At least 4 left for last board

    segments.push({ length: firstSegmentCells, type: 'board', end: Math.round(rng()) === 0 ? 'left' : 'right' });
    segments.push({ length: secondSegmentCells, type: 'space' });
    segments.push({ length: thirdSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right', end: Math.round(rng()) === 0 ? 'left' : 'right' });
    segments.push({ length: fourthSegmentCells, type: 'space' });
    segments.push({ length: fifthSegmentCells, type: 'board', start: Math.round(rng()) === 0 ? 'left' : 'right' });
  }

  const tiles: string[] = [];
  for (const segment of segments) {
    if (segment.type === 'board') {
      for (let i = 0; i < segment.length; i++) {
        if (segment.start && i === 0) {
          tiles.push(`board-up-${segment.start}`);
        } else if (segment.end && i === segment.length - 1) {
          tiles.push(`board-down-${segment.end}`);
        } else {
          tiles.push('board');
        }
      }
    } else {
      for (let i = 0; i < segment.length; i++) {
        tiles.push('blank');
      }
    }
  }

  return {
    index,
    columnType,
    segments,
    tiles,
  };
}

export function TileGrid({ rows = 24, columns = 24, seed }: { rows?: number; columns?: number; seed?: number | null }) {
  if (!seed) {
    return null;
  }

  const rng = seedrandom(seed?.toString() ?? 'hello');

  const cols: Column[] = [];
  for (let i = 0; i < columns; i++) {
    cols.push(getColumn(rng, i, rows));
  }

  const getTile = (col: Column, rowIndex: number) => {
    const tile = col.tiles[rowIndex];
    return tileTypes[tile as keyof typeof tileTypes];
  };

  return (
    <div className="p-1 flex flex-col bg-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-x-1"
        >
          {cols.map((col, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: '16px',
              }}
              className="aspect-square text-black hover:text-blue-600 transition-colors border-1 border-gray-400"
            >
              {getTile(col, rowIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
