'use client';

import type { Grid } from '@/app/lib/generate-grid';
import type { FormValues } from './sidebar';

export function Info({ grid, formValues }: { grid: Grid, formValues: FormValues }) {
  const { width, height, spacing, boardWidth } = formValues;
  const { rowCount, columnCount, columns } = grid;
  const left = (width - (columnCount * boardWidth) - ((columnCount - 1) * spacing)) / 2;
  const baseboardHeight = 5.5;
  const tileHeight = (height - (baseboardHeight + 0.75 + 0.75)) / rowCount;

  const boards: Record<number, number> = {};
  let squareFeet = 0;

  for (const column of columns) {
    for (const segment of column.segments) {
      if (segment.type === 'board') {
		    const length = segment.length * tileHeight;
        boards[length] = (boards[length] || 0) + 1;
		    squareFeet += (length * boardWidth) / 144;
      }
    }
  }

  let eightFootBoardsNeeded = 0;
  const remainingLengths = Object.entries(boards)
    .sort(([a], [b]) => parseFloat(b) - parseFloat(a)) // Sort descending
    .flatMap(([length, count]) =>
      Array(count).fill(parseFloat(length))
    );

  // Each 8-foot board has 96 inches of usable length
  let currentBoard = 96;
  for (const length of remainingLengths) {
    if (length > currentBoard) {
      // Need a new board
      eightFootBoardsNeeded++;
      currentBoard = 96;
    }
    currentBoard -= length;
    if (currentBoard < 1) { // If less than 1 inch remains, start a new board
      eightFootBoardsNeeded++;
      currentBoard = 96;
    }
  }
  if (currentBoard < 96) {
    eightFootBoardsNeeded++; // Count the last partial board if used
  }

  const boardsPerSheet = Math.floor(48.125 / (boardWidth + 0.125));
  const sheetsNeeded = Math.ceil(eightFootBoardsNeeded / boardsPerSheet);

  return (
    <div className="text-xs">
      <h4 className="text-lg font-bold">Info</h4>
      <div><label className="font-bold">Columns:</label> {grid.columnCount}</div>
      <div><label className="font-bold">Rows:</label> {grid.rowCount}</div>
      <div><label className="font-bold">Side gaps:</label> {left}"</div>
    </div>
  );
}
