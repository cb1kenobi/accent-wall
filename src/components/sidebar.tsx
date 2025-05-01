'use client';

import React from 'react';

function numberOfBoards(width: number, spacing: number, boardWidth: number) {
  return Math.floor((width + spacing) / (boardWidth + spacing));
}

interface SidebarProps {
  onFormChange: (formValues: FormValues) => void;
  onNewSeed: (seed: number) => void;
}

export interface FormValues {
    width: number;
    height: number;
    spacing: number;
    boardWidth: number;
}

export function Sidebar({ onFormChange, onNewSeed }: SidebarProps) {
  const [formValues, setFormValues] = React.useState<FormValues>({
    width: 153.25,
    height: 96,
    spacing: 0.75,
    boardWidth: 2.5
  });

  React.useEffect(() => {
    onFormChange(formValues);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    const newValues = {
      ...formValues,
      [name]: Math.max(numValue, 0.125)
    };
    setFormValues(newValues);
    onFormChange(newValues);
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
        <div className="flex flex-col">
          <div className="flex gap-x-2">
            <button
              type="button"
              onClick={handleNewSeed}
              className="bg-gray-600 px-2 py-1 rounded hover:bg-gray-300 cursor-pointer"
            >
              New Seed
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="width" className="text-sm font-medium">Width</label>
          <input
            type="number"
            id="width"
            name="width"
            value={formValues.width}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="height" className="text-sm font-medium">Height</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formValues.height}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="spacing" className="text-sm font-medium">Spacing</label>
          <input
            type="number"
            id="spacing"
            name="spacing"
            value={formValues.spacing}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="boardWidth" className="text-sm font-medium">Board Width</label>
          <input
            type="number"
            id="boardWidth"
            name="boardWidth"
            value={formValues.boardWidth}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}
