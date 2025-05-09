'use client';

import { Preview } from '@/components/preview';
import { Sidebar, type FormValues } from '@/components/sidebar';
import { TileGrid, TileType } from '@/components/tilegrid';
import { useEffect, useState } from 'react';
import { generateGrid, type Grid } from '@/app/lib/generate-grid';
import { Info } from '@/components/info';
import { Column, type Segment } from './lib/get-column';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

function numberOfBoards(width: number, spacing: number, boardWidth: number) {
  return Math.floor((width + spacing) / (boardWidth + spacing));
}

export default function Home() {
  const [columns, setColumns] = useState(24);
  const [filename, setFilename] = useState<string>('');
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const handleGrid = (rowCount: number) => {
    if (seed && formValues?.rows) {
      setGrid(generateGrid(seed, columns, rowCount));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    if (seedParam) {
      setSeed(parseInt(seedParam, 10));
    } else {
      setSeed(Math.floor(Math.random() * 1000000));
    }
    formValues && handleGrid(formValues.rows);
  }, [columns]);

  const handleNewSeed = () => {
    if (!grid?.seed && !confirm('Are you sure you want to generate a new seed?')) {
      return;
    }

    const newSeed = Math.floor(Math.random() * 1000000);
    const params = new URLSearchParams(window.location.search);
    params.set('seed', newSeed.toString());
    window.history.replaceState({}, '', `?${params.toString()}`);

    setSeed(newSeed);
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
      columns: [...grid.columns],
    };
    delete newGrid.seed;

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

  const handleLoad = () => {
    // TODO
  };

  const handleSave = () => {
    // show modal, get name, save to local storage
    const name = prompt('Enter a name for this design:', filename);
    if (name) {
      if (!grid) {
        alert('No grid to save!');
        return;
      }
      setFilename(name);
      const data = JSON.stringify({
        ...formValues,
        columns: grid.columns,
        seed: grid.seed,
      });
      console.log(data);
      // localStorage.setItem(name, JSON.stringify(formValues));
    }
  };

  return (
    <div className="flex gap-x-2 h-screen overflow-auto">
      <div className="flex flex-col gap-y-6 sticky top-2 h-fit p-2">
        <Sidebar onFormChange={handleFormChange} onNewSeed={handleNewSeed} onLoad={handleLoad} onSave={handleSave} />
        {grid && formValues && <Info grid={grid} formValues={formValues} />}
      </div>
      <div className="flex flex-col gap-y-2 p-2">
        {grid && <TileGrid grid={grid} onTileClick={handleTileClick} />}
        {grid && formValues && <Preview grid={grid} formValues={formValues} />}
      </div>
    </div>
  );
}
