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
import { saveDesignAction, getDesignsAction, loadDesignAction, deleteDesignAction } from '@/actions/designs';
import { Menubar } from '@/components/menubar';

function numberOfBoards(width: number, spacing: number, boardWidth: number) {
  return Math.floor((width + spacing) / (boardWidth + spacing));
}

export default function Home() {
  const [columns, setColumns] = useState(24);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [designId, setDesignId] = useState<string | undefined>(undefined);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

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

  const handleFill = () => {
    if (!confirm('Are you sure you want to fill the grid?')) {
      return;
    }

    if (grid) {
      const newGrid = {
        ...grid,
        columns: [...grid.columns],
      };
      for (const column of newGrid.columns) {
        column.tiles = Array(column.tiles.length).fill('board');
        column.segments = [
          {
            type: 'board',
            length: column.tiles.length,
          },
        ];
      }
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
    window.history.replaceState({}, '', url.toString());

    setSeed(newSeed);
    formValues && handleGrid(formValues.rows);
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

  const handleSave = async () => {
    if (!grid || !formValues) {
      alert('No grid to save!');
      return;
    }

    try {
      const data = {
        ...formValues,
        columns: grid.columns,
        designId,
        seed: grid.seed,
      };

      const newDesignId = await saveDesignAction(data);
      setDesignId(newDesignId);

      // Remove seed from URL and replace with designId
      const url = new URL(window.location.origin);
      url.searchParams.delete('seed');
      url.searchParams.set('designId', newDesignId);
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design. Please try again.');
    }
  };

  const handleLoadDesign = async (designId: string) => {
    try {
      const design = await loadDesignAction(designId);

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

      const url = new URL(window.location.origin);
      url.searchParams.delete('seed');
      url.searchParams.set('designId', designId);
      window.history.replaceState({}, '', url.toString());

      setOpen(false);

    } catch (error) {
      console.error('Failed to load design:', error);
      alert('Failed to load design. Please try again.');
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      await deleteDesignAction(designId);
      setDesigns(designs.filter((design) => design.designId !== designId));
    }
  };

  return (
    <div className="flex flex-col gap-x-2 h-screen">
      <Menubar onLoad={handleLoad} onNew={handleNew} onSave={handleSave} />

      <div className="flex flex-row grow overflow-hidden">
        <div className="flex flex-col gap-y-6 sticky top-2 p-2 overflow-y-auto">
          <Sidebar
            onFormChange={handleFormChange}
            resetTrigger={resetTrigger}
            initialValues={formValues || undefined}
          />
          {grid && formValues && <Info grid={grid} formValues={formValues} />}
        </div>

        <div className="flex flex-col gap-y-2 p-2 overflow-y-auto flex-1">
          {grid && <TileGrid grid={grid} onFill={handleFill} onTileClick={handleTileClick} />}
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
