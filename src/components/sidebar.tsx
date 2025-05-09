'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface SidebarProps {
  onFormChange: (formValues: FormValues) => void;
  onNewSeed: () => void;
  onLoad: () => void;
  onSave: () => void;
}

export interface FormValues {
    width: number;
    height: number;
    spacing: number;
    boardWidth: number;
    rows: number;
}

export function Sidebar({ onFormChange, onNewSeed, onLoad, onSave }: SidebarProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    width: 153.25,
    height: 96,
    spacing: 0.75,
    boardWidth: 2.5,
    rows: 24
  });

  useEffect(() => {
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

  return (
    <div className="flex flex-col gap-y-2 w-32">
      <div className="flex flex-col gap-y-2">
        <Button
          onClick={onLoad}
          className="bg-blue-600 px-2 py-1 text-sm text-white rounded hover:bg-blue-700 cursor-pointer w-full"
        >
          Load
        </Button>
        <Button
          onClick={onSave}
          className="bg-blue-600 px-2 py-1 text-sm text-white rounded hover:bg-blue-700 cursor-pointer w-full"
        >
          Save
        </Button>
        <Button
          onClick={onNewSeed}
          className="bg-blue-600 px-2 py-1 text-sm text-white rounded hover:bg-blue-700 cursor-pointer w-full"
        >
          Generate New
        </Button>

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
