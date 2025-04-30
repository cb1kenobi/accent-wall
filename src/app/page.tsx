'use client';

import { Sidebar } from '@/components/sidebar';
import { TileGrid } from '@/components/tilegrid';
import React from 'react';

export default function Home() {
  const [columns, setColumns] = React.useState(24);
  const [seed, setSeed] = React.useState<number | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('seed');
    if (seedParam) {
      setSeed(parseInt(seedParam, 10));
    } else {
      setSeed(Math.floor(Math.random() * 1000000));
    }
  }, []);

  return (
    <div className="p-2 flex gap-x-2">
      <Sidebar onColumnsChange={setColumns} setSeed={setSeed} />
      <TileGrid rows={24} columns={columns} seed={seed} />
    </div>
  );
}
