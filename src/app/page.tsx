'use client';

import { Preview } from '@/components/preview';
import { Sidebar, type FormValues } from '@/components/sidebar';
import { TileGrid, TileType } from '@/components/tilegrid';
import React from 'react';
import { generateGrid, type Grid } from '@/app/lib/generate-grid';
import { Info } from '@/components/info';
import { Column, type Segment } from './lib/get-column';

function numberOfBoards(width: number, spacing: number, boardWidth: number) {
  return Math.floor((width + spacing) / (boardWidth + spacing));
}

export default function Home() {
  const [columns, setColumns] = React.useState(24);
  const [formValues, setFormValues] = React.useState<FormValues | null>(null);
  const [seed, setSeed] = React.useState<number | null>(null);
  const [grid, setGrid] = React.useState<Grid | null>(null);

  const handleGrid = (rowCount: number) => {
    if (seed && formValues?.rows) {
      setGrid(generateGrid(seed, columns, rowCount));
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    if (seedParam) {
      setSeed(parseInt(seedParam, 10));
    } else {
      setSeed(Math.floor(Math.random() * 1000000));
    }
    formValues && handleGrid(formValues.rows);
  }, [columns]);

  const handleNewSeed = (seed: number) => {
    if (grid?.custom && !confirm('Are you sure you want to generate a new seed?')) {
      return;
    }
    setSeed(seed);
    formValues && handleGrid(formValues.rows);
  };

  const handleFormChange = (formValues: FormValues) => {
    setFormValues(formValues);
    const calculatedColumns = numberOfBoards(
      formValues.width,
      formValues.spacing,
      formValues.boardWidth
    );
    setColumns(calculatedColumns);
    handleGrid(formValues.rows);
  };

  const handleTileClick = (col: Column, rowIndex: number, tileType: TileType) => {
    if (!grid) {
      return;
    }

    const newGrid = {
      ...grid,
      custom: true,
      columns: [...grid.columns],
    };

    const column = newGrid.columns[col.index];
    column.tiles[rowIndex] = tileType;

    const segments: Segment[] = [];
    let lastType: string | null = null;
    for (let i = 0; i < column.tiles.length; i++) {
      const type = column.tiles[i];
      const thisType = type === 'blank' ? 'blank' : 'board';

      if (thisType === lastType) {
        segments[segments.length - 1].length++;
      } else {
        segments.push({
          type: type === 'blank' ? 'space' : 'board',
          length: 1,
        });
      }

      const s = segments[segments.length - 1];
      if (type === 'board-up-left') {
        s.start = 'left';
      } else if (type === 'board-up-right') {
        s.start = 'right';
      }
      if (type === 'board-down-left') {
        s.end = 'left';
      } else if (type === 'board-down-right') {
        s.end = 'right';
      }

      lastType = type === 'blank' ? type : 'board';
    }

    column.segments = segments;
    setGrid(newGrid);
  };

  return (
    <div className="flex gap-x-2 h-screen overflow-auto">
      <div className="flex flex-col gap-y-6 sticky top-2 h-fit p-2">
        <Sidebar onFormChange={handleFormChange} onNewSeed={handleNewSeed} />
        {grid && formValues && <Info grid={grid} formValues={formValues} />}
      </div>
      <div className="flex flex-col gap-y-2 p-2">
        {grid && <TileGrid grid={grid} onTileClick={handleTileClick} />}
        {grid && formValues && <Preview grid={grid} formValues={formValues} />}
      </div>
    </div>
  );
}
