'use client';

import { Preview } from '@/components/preview';
import { Sidebar, type FormValues } from '@/components/sidebar';
import { TileGrid } from '@/components/tilegrid';
import React from 'react';
import { generateGrid, type Grid } from '@/app/lib/generate-grid';
import { Info } from '@/components/info';

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

  return (
    <div className="p-2 flex gap-x-2">
      <div className="flex flex-col gap-y-6">
        <Sidebar onFormChange={handleFormChange} onNewSeed={handleNewSeed} />
        {grid && formValues && <Info grid={grid} formValues={formValues} />}
      </div>
      <div className="flex flex-col gap-y-2">
        {grid && <TileGrid grid={grid} />}
        {grid && formValues && <Preview grid={grid} formValues={formValues} />}
      </div>
    </div>
  );
}
