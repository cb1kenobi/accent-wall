'use client';

import type { Grid } from '@/app/lib/generate-grid';
import type { FormValues } from './sidebar';

interface Board {
  length: number;
  start?: 'left' | 'right';
  end?: 'left' | 'right';
  columns: number[];
}

interface CutlistChunk {
  length: number;
  column: number;
  start?: 'left' | 'right';
  end?: 'left' | 'right';
}

class CutlistBoard {
  availableLength = 96;
  chunks: CutlistChunk[] = [];

  addChunk(chunk: CutlistChunk) {
    this.chunks.push(chunk);
    this.availableLength -= chunk.length;
  }
}

export function Preview({ grid, formValues }: { grid: Grid, formValues: FormValues }) {
  const { width, height, spacing, boardWidth } = formValues;
  const { rowCount, columnCount, columns } = grid;
  const left = (width - (columnCount * boardWidth) - ((columnCount - 1) * spacing)) / 2;
  const baseboardHeight = 5.5;
  const startHeight = 0.75;
  const tileHeight = (height - (baseboardHeight + 0.75 + 0.75)) / rowCount;

  const boardsMap: Record<string, Board> = {};
  let columnId = 0;
  for (const column of columns) {
    for (const segment of column.segments) {
      if (segment.type === 'board') {
		    const length = segment.length * tileHeight;
        const key = `${length}-${segment.start}-${segment.end}`;
        if (!boardsMap[key]) {
          boardsMap[key] = {
            length,
            start: segment.start,
            end: segment.end,
            columns: [columnId],
          };
        } else {
          boardsMap[key].columns.push(columnId);
        }
	    }
    }
    columnId++;
  }

  let boardCount = 0;
  const boards = Object.values(boardsMap).sort((a, b) => b.length - a.length);
  const cutlist: CutlistBoard[] = [];
  let squareFeet = 0;
  for (const board of boards) {
    for (const column of board.columns) {
      let currentBoard = cutlist.find(b => b.availableLength >= board.length);
      if (!currentBoard) {
        currentBoard = new CutlistBoard();
        cutlist.push(currentBoard);
      }
      currentBoard.addChunk({
        length: board.length,
        column: column,
        start: board.start,
        end: board.end,
      });
      boardCount++;
      squareFeet += board.length * boardWidth / 144;
    }
  }

  const kerf = 0.125;
  const extra = 1;
  const boardsPerSheet = Math.floor((48 + kerf - extra) / (boardWidth + kerf));
  const sheetsNeeded = Math.ceil(cutlist.length / boardsPerSheet);

  return (
    <div className="pb-2">
      <h4 className="text-lg font-bold">Preview</h4>
      <div className="p-1">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="border-2 border-gray-300"
          xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="gray"
          />
          <rect
              x="0"
              y={height - baseboardHeight}
              width={width}
              height={baseboardHeight}
              fill="black"
          />
          {columns.flatMap((column, i) => {
            let y = startHeight;

            return column.segments.flatMap((segment, j) => {
              const top = y;
              y += segment.length * tileHeight;

              if (segment.type === 'board') {
                // 0,0 is the top left

                const box = [
                  // top left
                  { x: left + (i * (boardWidth + spacing)), y: top - (segment.start === 'left' ? boardWidth : 0) },
                  // bottom left
                  { x: left + (i * (boardWidth + spacing)), y: top + (segment.length * tileHeight) - (segment.end === 'right' ? boardWidth : 0) },
                  // bottom right
                  { x: left + (i * (boardWidth + spacing)) + boardWidth, y: top + (segment.length * tileHeight) - (segment.end === 'left' ? boardWidth : 0) },
                  // top right
                  { x: left + (i * (boardWidth + spacing)) + boardWidth, y: top - (segment.start === 'right' ? boardWidth : 0) },
                ];

                return (
                  <path
                    key={`board-${i}-${j}`}
                    d={`M ${box[0].x},${box[0].y}
                      L ${box[1].x},${box[1].y}
                      L ${box[2].x},${box[2].y}
                      L ${box[3].x},${box[3].y}
                      Z`}
                    fill="black"
                  />
                );
              }

              // space
              return null;
            });
          })}
          {columns.map((column, i) => {
            return (
              <text
                key={`column-${i}`}
                x={left + (i * (boardWidth + spacing)) + (boardWidth / 2)}
                y={height - 3}
                fill="gray"
                fontSize="1.5"
                textAnchor="middle"
              >{i + 1}</text>
            );
          })}
        </svg>
      </div>
      <h4 className="text-lg font-bold mt-2">Cutlist</h4>
      <div className="text-xs">
        <div><label className="w-10 font-bold">Square feet:</label> {squareFeet.toFixed(2)}</div>
        <div><label className="w-10 font-bold">Boards needed:</label> {boardCount}</div>
        <div><label className="w-10 font-bold">8' strips needed:</label> {cutlist.length}</div>
        <div><label className="w-10 font-bold">8' strips per sheet:</label> {boardsPerSheet}</div>
        <div><label className="w-10 font-bold">Sheets needed:</label> {sheetsNeeded}</div>
        <div><label className="w-10 font-bold">Blade kerf:</label> {kerf}"</div>
      </div>
      {cutlist.map((board, i) => {
        let left = 0;
        return (
          <div className="flex flex-row items-center mt-1" key={`cutlist-${i}`}>
            <div className="w-10">{i + 1}</div>
            <svg
              key={`cutlist-${i}`}
              height="30"
              width="1024"
              preserveAspectRatio="xMinYMid"
              viewBox="0 0 1024 30"
            >
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {board.chunks.map((chunk, j) => {
                const percentage = (chunk.length / 96) * 100;
                const x = left;
                left += percentage;
                return (
                  <g key={`cutlist-${i}-${j}`}>
                    <path
                      d={`M ${(x/100) * 1024 + (chunk.start === 'left' ? 30 : 0)} 0
                          L ${((x + percentage)/100) * 1024 - (chunk.end === 'left' ? 30 : 0)} 0
                          L ${((x + percentage)/100) * 1024 - (chunk.end === 'right' ? 30 : 0)} 30
                          L ${(x/100) * 1024 + (chunk.start === 'right' ? 30 : 0)} 30 Z`}
                      fill={j === 0 ? '#999' : j === 1 ? '#888' : j === 2 ? '#777' : '#666'}
                    />
                    <text
                      x={`${x + (percentage/2)}%`}
                      y="50%"
                      fill="black"
                      fontSize="14"
                      dominantBaseline="middle"
                      textAnchor="middle"
                    >{chunk.length.toFixed(4)}" (col {chunk.column + 1})</text>
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
