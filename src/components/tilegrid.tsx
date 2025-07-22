'use client';

import type { Grid } from '@/app/lib/generate-grid';
import type { Column } from '@/app/lib/get-column';
import React, { useState, useEffect } from 'react';

const tileTypes = {
  'blank': (
    <svg key="5" viewBox="0 0 100 100" className="w-full h-full">
    </svg>
  ),
  'board-up-left': (
    <svg key="1" viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="0,0 100,100 0,100" fill="currentColor" />
    </svg>
  ),
  'board-up-right': (
    <svg key="4" viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="100,0 100,100 0,100" fill="currentColor" />
    </svg>
  ),
  'board': (
    <svg key="6" viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="currentColor" />
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
};

export type TileType = keyof typeof tileTypes;

export function TileGrid({ grid, onFill, onTileClick }: {
  grid?: Grid | null;
  onFill: () => void;
  onTileClick: (col: Column, rowIndex: number, tileType: TileType) => void;
}) {
  if (!grid) {
    return null;
  }

  const [activeType, setActiveType] = useState<TileType>('blank');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if an input field is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );

      if (isInputFocused) {
        return;
      }

      const keyToType: { [key: string]: TileType } = {
        '1': 'blank',
        '2': 'board-up-left',
        '3': 'board-up-right',
        '4': 'board',
        '5': 'board-down-right',
        '6': 'board-down-left',
      };

      const tileType = keyToType[event.key];
      if (tileType) {
        setActiveType(tileType);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="flex flex-row gap-1">
      <div className="flex flex-col bg-gray-700 rounded-sm">
        {Object.keys(tileTypes).map((type, idx) => (
          <div
            className={`w-6 h-6 m-2 bg-white text-black ${activeType === type ? 'border-3 border-blue-500' : 'border-1 border-gray-400'} cursor-pointer`}
            key={type}
            onClick={() => setActiveType(type as keyof typeof tileTypes)}
            title={`${type}${idx < 7 ? ` (key: ${idx + 1})` : ''}`}
          >
            {tileTypes[type as keyof typeof tileTypes]}
          </div>
        ))}
        <div
          className="w-6 h-6 m-2 bg-black text-white border-1 border-gray-400 cursor-pointer text-center text-xs leading-6"
          onClick={onFill}
          title="Fill entire grid"
        >
          Fill
        </div>
      </div>
      <div className="p-1 flex flex-row gap-x-1 bg-gray-200">
        {grid.columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col"
          >
            {Array.from({ length: grid.rowCount }).map((_, rowIndex) => {
              const currentTile = col.tiles[rowIndex];
              const tile = tileTypes[currentTile as keyof typeof tileTypes];
              const lastTile = rowIndex > 0 ? col.tiles[rowIndex - 1] : null;

              let doesTileMakeSense = true;
              if (lastTile === null) {
                // do nothing
              } else if (lastTile === 'blank') {
                doesTileMakeSense = currentTile === 'board-down-left' || currentTile === 'board-down-right' ? false : true;
              } else if (lastTile === 'board' && (currentTile === 'board-up-left' || currentTile === 'board-up-right')) {
                doesTileMakeSense = false;
              } else if ((lastTile === 'board-down-left' || lastTile === 'board-down-right') && currentTile !== 'blank') {
                doesTileMakeSense = false;
              } else if ((lastTile === 'board-up-left' || lastTile === 'board-up-right') && (currentTile !== 'board' && currentTile !== 'board-down-left' && currentTile !== 'board-down-right')) {
                doesTileMakeSense = false;
              }

              return (
                <div
                  key={rowIndex}
                  style={{
                    width: '16px',
                  }}
                  className={`aspect-square ${doesTileMakeSense ? 'text-black' : 'text-red-500'} hover:text-blue-600 hover:border-blue-600 hover:border-2 transition-colors border-1  border-gray-400 cursor-pointer`}
                  onClick={() => onTileClick(col, rowIndex, activeType)}
                >
                  {tile}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
