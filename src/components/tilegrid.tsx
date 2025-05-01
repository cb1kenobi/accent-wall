'use client';

import type { Grid } from '@/app/lib/generate-grid';
import type { Column } from '@/app/lib/get-column';
import React from 'react';

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

export function TileGrid({ grid }: { grid?: Grid | null; }) {
  if (!grid) {
    return null;
  }

  const getTile = (col: Column, rowIndex: number) => {
    const tile = col.tiles[rowIndex];
    return tileTypes[tile as keyof typeof tileTypes];
  };

  return (
    <div className="p-1 flex flex-col bg-gray-200">
      {Array.from({ length: grid.rowCount }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-x-1"
        >
          {grid.columns.map((col, colIndex) => (
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
