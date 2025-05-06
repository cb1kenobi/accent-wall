'use client';

import React from 'react';

interface SidebarProps {
  onFormChange: (formValues: FormValues) => void;
  onNewSeed: (seed: number) => void;
}

export interface FormValues {
    width: number;
    height: number;
    spacing: number;
    boardWidth: number;
    rows: number;
}

export function Sidebar({ onFormChange, onNewSeed }: SidebarProps) {
  const [formValues, setFormValues] = React.useState<FormValues>({
    width: 153.25,
    height: 96,
    spacing: 0.75,
    boardWidth: 2.5,
    rows: 24
  });

  React.useEffect(() => {
    onFormChange(formValues);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    const newValues = {
      ...formValues,
      [name]: name === 'rows' ? Math.max(numValue, 15) : Math.max(numValue, 0.125)
    };
    setFormValues(newValues);
    onFormChange(newValues);
  };

  const handleLoad = () => {
    // TODO
  };

  const handleSave = () => {
    // TODO
  };

  const handleNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    const params = new URLSearchParams(window.location.search);
    params.set('seed', newSeed.toString());
    window.history.replaceState({}, '', `?${params.toString()}`);
    onNewSeed(newSeed);
  }

  return (
    <div className="flex flex-col gap-y-2 w-32">
      <div className="flex flex-col gap-y-2">
        <button
          type="button"
          onClick={handleLoad}
          disabled={true}
          className="bg-blue-600 disabled:bg-gray-400 disabled:text-gray-600 px-2 py-1 text-sm rounded hover:bg-gray-300 cursor-pointer w-full"
        >
          Load
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={true}
          className="bg-blue-600 disabled:bg-gray-400 disabled:text-gray-600 px-2 py-1 text-sm rounded hover:bg-gray-300 cursor-pointer w-full"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleNewSeed}
          className="bg-blue-600 px-2 py-1 text-sm rounded hover:bg-blue-700 cursor-pointer w-full"
        >
          Generate New
        </button>

        <div className="flex flex-col">
          <label htmlFor="rows" className="text-sm font-medium">Rows</label>
          <input
            type="number"
            id="rows"
            name="rows"
            min={15}
            value={formValues.rows}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="width" className="text-sm font-medium">Width (in)</label>
          <input
            type="number"
            id="width"
            name="width"
            min={1}
            value={formValues.width}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="height" className="text-sm font-medium">Height (in)</label>
          <input
            type="number"
            id="height"
            name="height"
            min={1}
            value={formValues.height}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="spacing" className="text-sm font-medium">Spacing (in)</label>
          <input
            type="number"
            id="spacing"
            name="spacing"
            min={0}
            value={formValues.spacing}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="boardWidth" className="text-sm font-medium">Board Width (in)</label>
          <input
            type="number"
            id="boardWidth"
            name="boardWidth"
            min={0.75}
            value={formValues.boardWidth}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}
