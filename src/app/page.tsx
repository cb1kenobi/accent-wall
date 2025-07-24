'use client';

import { Preview } from '@/components/preview';
import { Sidebar, type FormValues } from '@/components/sidebar';
import { TileGrid, TileType } from '@/components/tilegrid';
import { useCallback, useEffect, useState } from 'react';
import { generateGrid, type Grid } from '@/app/lib/generate-grid';
import { Info } from '@/components/info';
import { Column, type Segment } from './lib/get-column';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { saveDesignAction, getDesignsAction, loadDesignAction, deleteDesignAction } from '@/actions/designs';
import { Menubar } from '@/components/menubar';

function numberOfBoards(width: number, spacing: number, boardWidth: number) {
  return Math.floor((width + spacing) / (boardWidth + spacing));
}

const defaultFormValues: FormValues = {
  name: 'Untitled',
  width: 153.25,
  height: 96,
  spacing: 0.75,
  boardWidth: 2.5,
  rows: 24
};

export default function Home() {
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [columns, setColumns] = useState(numberOfBoards(
    formValues.width,
    formValues.spacing,
    formValues.boardWidth
  ));
  const [designId, setDesignId] = useState<string | undefined>(undefined);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const handleGrid = (rowCount: number, seed: number | null) => {
    if (seed && rowCount) {
      setGrid(generateGrid(seed, columns, rowCount));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    const designIdParam = params.get('designId');

    if (designIdParam) {
      setDesignId(designIdParam);
      handleLoadDesign(designIdParam);
    } else {
      let s = seed;
      if (seedParam) {
        setSeed(s = parseInt(seedParam, 10));
      } else if (!seed) {
        setSeed(s = Math.floor(Math.random() * 1000000));
      }
      handleGrid(formValues.rows, s);
    }
  }, []);

  const handleFormChange = (newFormValues: FormValues) => {
    if (newFormValues.rows !== formValues.rows
      || newFormValues.width !== formValues.width
      || newFormValues.height !== formValues.height
      || newFormValues.spacing !== formValues.spacing
      || newFormValues.boardWidth !== formValues.boardWidth
    ) {
      const calculatedColumns = numberOfBoards(
        newFormValues.width,
        newFormValues.spacing,
        newFormValues.boardWidth
      );
      setColumns(calculatedColumns);
      handleGrid(newFormValues.rows, seed);
    }
    setFormValues(newFormValues);
  };

  const handleTileClick = useCallback((col: Column, rowIndex: number, tileType: TileType) => {
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
      const thisType = type === 'space' ? 'space' : 'board';

      if (thisType === lastType) {
        segments[segments.length - 1].length++;
      } else {
        segments.push({
          type: type === 'space' ? 'space' : 'board',
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

      lastType = type === 'space' ? 'space' : 'board';
    }

    column.segments = segments;
    setGrid(newGrid);
  }, [grid]);

  const handleFill = (type: 'space' | 'board') => {
    if (!confirm('Are you sure you want to fill the grid?')) {
      return;
    }

    if (grid) {
      const newGrid = {
        ...grid,
        columns: [...grid.columns],
      };
      for (const column of newGrid.columns) {
        column.tiles = Array(column.tiles.length).fill(type);
        column.segments = [
          {
            type,
            length: column.tiles.length,
          },
        ];
      }
      setSeed(null);
      setGrid(newGrid);
    }
  };

  const handleNew = () => {
    setDesignId(undefined);
    setResetTrigger(prev => prev + 1);

    const newSeed = Math.floor(Math.random() * 1000000);
    const url = new URL(window.location.href);
    url.searchParams.delete('designId');
    url.searchParams.set('seed', newSeed.toString());
    window.history.pushState({}, '', url.toString());

    setSeed(newSeed);
    setFormValues(defaultFormValues);
    handleGrid(defaultFormValues.rows, newSeed);
  };

  const handleLoad = async () => {
    setLoadingDesigns(true);
    try {
      const userDesigns = await getDesignsAction();
      setDesigns(userDesigns);
      setOpen(true);
    } catch (error) {
      console.error('Failed to load designs:', error);
      alert('Failed to load designs. Please try again.');
    } finally {
      setLoadingDesigns(false);
    }
  };

  const doSave = async ({ designId, name }: { designId?: string, name?: string }) => {
    if (!grid || !formValues) {
      alert('No grid to save!');
      return;
    }

    try {
      const data = {
        ...formValues,
        name: name || formValues.name,
        columns: grid.columns,
        designId,
        seed: grid.seed,
      };

      const newDesignId = await saveDesignAction(data);
      setDesignId(newDesignId);

      // Update the designs state
      const savedDesign = {
        designId: newDesignId,
        name: formValues.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newDesigns = [...designs];
      const existing = newDesigns.find(design => design.designId === newDesignId);
      if (existing) {
        Object.assign(existing, savedDesign);
      } else {
        newDesigns.push(savedDesign);
      }

      setDesigns(newDesigns);

      // Remove seed from URL and replace with designId
      const url = new URL(window.location.origin);
      url.searchParams.delete('seed');
      url.searchParams.set('designId', newDesignId);
      window.history.pushState({}, '', url.toString());
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design. Please try again.');
    }
  };

  const handleSave = () => doSave({ designId });

  const handleSaveAs = () => {
    const name = prompt('Enter a name for the new design', `${formValues.name} (copy)`);
    if (name) {
      return doSave({ name });
    }
  };

  const handleLoadDesign = async (designId: string) => {
    try {
      const design = await loadDesignAction(designId);
      if (!design) {
        alert('Design not found');
        handleNew();
        return;
      }

      // Restore form values
      setFormValues({
        name: design.name,
        width: design.width,
        height: design.height,
        spacing: design.spacing,
        boardWidth: design.boardWidth,
        rows: design.rows,
      });

      // Restore grid
      const restoredGrid: Grid = {
        columnCount: design.columns.length,
        columns: design.columns,
        rowCount: design.rows,
        seed: design.seed,
      };
      setGrid(restoredGrid);

      setDesignId(designId);

      const url = new URL(window.location.origin);
      url.searchParams.delete('seed');
      url.searchParams.set('designId', designId);
      window.history.pushState({}, '', url.toString());

      setOpen(false);
    } catch (error) {
      console.error('Failed to load design:', error);
      alert('Failed to load design');
      handleNew();
    }
  };

  const handleDeleteDesign = async (deleteDesignId: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      if (designId === deleteDesignId) {
        setDesignId(undefined);
        const url = new URL(window.location.origin);
        url.searchParams.delete('designId');
        url.searchParams.delete('seed');
        window.history.pushState({}, '', url.toString());
      }
      await deleteDesignAction(deleteDesignId);
      setDesigns(designs.filter((design) => design.designId !== deleteDesignId));
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-x-2 h-screen">
      <div className="no-print">
        <Menubar designId={designId} onLoad={handleLoad} onNew={handleNew} onSave={handleSave} onSaveAs={handleSaveAs} />
      </div>

      <div className="flex flex-row grow overflow-hidden print-container">
        <div className="flex flex-col gap-y-6 sticky top-2 p-2 overflow-y-auto no-print">
          <Sidebar
            onFormChange={handleFormChange}
            resetTrigger={resetTrigger}
            initialValues={formValues || undefined}
          />
          {grid && formValues && <Info grid={grid} formValues={formValues} />}
        </div>

        <div className="flex flex-col gap-y-2 p-2 overflow-y-auto flex-1 print-container">
          <div className="no-print">
            {grid && <TileGrid grid={grid} onFill={handleFill} onTileClick={handleTileClick} />}
          </div>
          {grid && formValues && <Preview grid={grid} formValues={formValues} />}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Load Design</DialogTitle>
              <DialogDescription>
                Select a design to load from your saved designs.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-96 overflow-y-auto">
              {loadingDesigns ? (
                <div className="flex items-center justify-center py-8">
                  <div>Loading designs...</div>
                </div>
              ) : designs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No saved designs found.
                </div>
              ) : (
                <div className="space-y-2">
                  {designs.map((design) => (
                    <div
                      key={design.designId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{design.name}</h3>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(design.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-x-2">
                        <Button
                          onClick={() => handleLoadDesign(design.designId)}
                          className="cursor-pointer"
                          variant="outline"
                          size="sm"
                        >
                          Load
                        </Button>
                        <Button variant="destructive" className="cursor-pointer" size="sm" onClick={() => handleDeleteDesign(design.designId)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex sm:justify-center">
              <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
