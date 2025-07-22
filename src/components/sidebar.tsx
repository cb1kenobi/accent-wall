'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface SidebarProps {
  onFormChange: (formValues: FormValues) => void;
  resetTrigger?: number;
  initialValues: FormValues;
}

export interface FormValues {
    name: string;
    width: number;
    height: number;
    spacing: number;
    boardWidth: number;
    rows: number;
}

export function Sidebar({ onFormChange, resetTrigger, initialValues }: SidebarProps) {
  const [formValues, setFormValues] = useState<FormValues>(initialValues);

  useEffect(() => {
    if (resetTrigger !== undefined) {
      const newValues = {
        ...initialValues,
      };
      setFormValues(newValues);
      onFormChange(newValues);
    }
  }, [resetTrigger]);

  // Add effect to handle loading initial values
  useEffect(() => {
    if (initialValues) {
      setFormValues(initialValues);
    }
  }, [initialValues]);

  const onNameFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === 'Untitled') {
      e.target.select();
    }
  };

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newValues = { ...formValues, name: value };
    setFormValues(newValues);
    onFormChange(newValues);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    const newValues = {
      ...formValues,
      [name]: isNaN(numValue) ? '' : name === 'rows' ? Math.max(numValue, 15) : Math.max(numValue, 0.125)
    };
    setFormValues(newValues);
    if (!isNaN(numValue)) {
      onFormChange(newValues);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onFormChange(formValues);
  };

  return (
    <div className="flex flex-col gap-y-2 w-40">
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col">
          <label htmlFor="rows" className="text-sm font-medium">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formValues.name}
            onFocus={onNameFocus}
            onBlur={handleBlur}
            onChange={onNameChange}
            className="border rounded px-2 py-1"
            autoComplete="off"
            maxLength={255}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="rows" className="text-sm font-medium">Rows</label>
          <input
            type="number"
            id="rows"
            name="rows"
            min={15}
            value={formValues.rows}
            onBlur={handleBlur}
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
            onChange={handleInputChange}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}
