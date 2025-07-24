'use client';

import seedrandom from 'seedrandom';

export type SegmentType = 'board' | 'space';

export interface Segment {
  length: number;
  type: SegmentType;
  start?: 'left' | 'right';
  end?: 'left' | 'right';
}

export interface Column {
  index: number;
  segments: Segment[];
  tiles: string[];
}

// Define column types with their weights
const columnTypeWeights: { type: string; weight: number }[] = [
  { type: 'board-space', weight: 20 },
  { type: 'space-board', weight: 20 },
  { type: 'board-space-board', weight: 30 },
  { type: 'space-board-space', weight: 5 },
  { type: 'board-space-board-space', weight: 5 },
  { type: 'space-board-space-board', weight: 3 },
  { type: 'board-space-board-space-board', weight: 2 },
];

// Create the original columnTypes array for backward compatibility
const columnTypes = columnTypeWeights.map(item => item.type);

// Function to select a weighted random column type
function selectWeightedColumnType(rng: seedrandom.PRNG): string {
  const totalWeight = columnTypeWeights.reduce((sum, item) => sum + item.weight, 0);
  const randomValue = rng() * totalWeight;

  let currentWeight = 0;
  for (const item of columnTypeWeights) {
    currentWeight += item.weight;
    if (randomValue <= currentWeight) {
      return item.type;
    }
  }

  // Fallback (should never reach here)
  return columnTypeWeights[0].type;
}

export function getColumn2(rng: seedrandom.PRNG, index: number, cellCount: number): Column {
  const segments: Segment[] = [];
  const randPoint = () => { return Math.round(rng()) === 0 ? 'left' : 'right' };
  const chunks = generateColumnChunks(rng);
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  let total = 0;
  let i = 0;

  for (const chunk of chunks) {
    const result: Partial<Segment> = { length: 0, type: chunk.type };
    if (i + 1 === chunks.length) {
      // last one
      result.length = Math.max(2, cellCount - total);
      if (chunk.type === 'board') {
        result.start = randPoint();
      }
    } else if (i === 0) {
      // first one
      result.length = Math.max(2, Math.floor(cellCount * (chunk.length / totalLength)));
      if (chunk.type === 'board') {
        result.end = randPoint();
      }
    } else {
      result.length = Math.max(2, Math.floor(cellCount * (chunk.length / totalLength)));
      if (chunk.type === 'board') {
        result.start = randPoint();
        result.end = randPoint();
      }
    }

    segments.push(result as Segment);
    i++;
    total += result.length;
  }

  return {
    index,
    segments,
    tiles: generateTiles(segments),
  };
}

function generateColumnChunks(rng: seedrandom.PRNG): { length: number, type: 'board' | 'space' }[] {
  const columnType = selectWeightedColumnType(rng);
  const chunks: { length: number, type: 'board' | 'space' }[] = [];
  const types = columnType.split('-');
  let i = 0;
  const len = types.length;
  for (const type of types) {
    chunks.push(generateChunk(rng, type as 'board' | 'space', i++, len));
  }
  return chunks;
}

function generateChunk(rng: seedrandom.PRNG, type: 'board' | 'space', i: number, len: number): { length: number, type: 'board' | 'space' } {
  if (type === 'board') {
    const min = 25;
    const max = 100;
    return { length: Math.floor(rng() * (max - min + 1)) + min, type };
  }

  if (i === 0 || i === len - 1) {
    const min = 5;
    const max = 15;
    return { length: Math.floor(rng() * (max - min + 1)) + min, type };
  }

  const min = 5;
  const max = 30;
  return { length: Math.floor(rng() * (max - min + 1)) + min, type };
}

export function getColumn(rng: seedrandom.PRNG, index: number, cellCount: number): Column {
  const columnType = selectWeightedColumnType(rng);
  const segments: Segment[] = [];
  const randPoint = () => { return Math.round(rng()) === 0 ? 'left' : 'right' };
  const minBoardCells = 6;
  const minSpaceCells = 2;

  // randomly pick segment lengths
  if (columnType === 'board-space' || columnType === 'space-board') {
    // 2 segments
    if (columnType === 'board-space') {
      const firstSegmentCells = Math.max(minBoardCells, Math.floor(rng() * (cellCount - minSpaceCells)) + 1);
      const secondSegmentCells = cellCount - firstSegmentCells;
      segments.push({ length: firstSegmentCells, type: 'board', end: randPoint() });
      segments.push({ length: secondSegmentCells, type: 'space' });
    } else {
      const firstSegmentCells = Math.max(minSpaceCells, Math.floor(rng() * (cellCount - minBoardCells)) + 1);
      const secondSegmentCells = cellCount - firstSegmentCells;
      segments.push({ length: firstSegmentCells, type: 'space' });
      segments.push({ length: secondSegmentCells, type: 'board', start: randPoint() });
    }
  } else if (columnType === 'board-space-board' || columnType === 'space-board-space') {
    // 3 segments
    if (columnType === 'board-space-board') {
      const minTotal = 2 * minBoardCells + minSpaceCells;
      const remainingCells = cellCount - minTotal;
      const firstExtra = Math.floor(rng() * remainingCells);
      const secondExtra = Math.floor(rng() * (remainingCells - firstExtra));
      const thirdExtra = remainingCells - firstExtra - secondExtra;

      const firstSegmentCells = minBoardCells + firstExtra;
      const secondSegmentCells = minSpaceCells + secondExtra;
      const thirdSegmentCells = minBoardCells + thirdExtra;

      segments.push({ length: firstSegmentCells, type: 'board', end: randPoint() });
      segments.push({ length: secondSegmentCells, type: 'space' });
      segments.push({ length: thirdSegmentCells, type: 'board', start: randPoint() });
    } else {
      const minTotal = minBoardCells + 2 * minSpaceCells;
      const remainingCells = cellCount - minTotal;
      const firstExtra = Math.floor(rng() * remainingCells);
      const secondExtra = Math.floor(rng() * (remainingCells - firstExtra));
      const thirdExtra = remainingCells - firstExtra - secondExtra;

      const firstSegmentCells = minSpaceCells + firstExtra;
      const secondSegmentCells = minBoardCells + secondExtra;
      const thirdSegmentCells = minSpaceCells + thirdExtra;

      segments.push({ length: firstSegmentCells, type: 'space' });
      segments.push({ length: secondSegmentCells, type: 'board', start: randPoint(), end: randPoint() });
      segments.push({ length: thirdSegmentCells, type: 'space' });
    }
  } else if (columnType === 'board-space-board-space' || columnType === 'space-board-space-board') {
    // 4 segments
    if (columnType === 'board-space-board-space') {
      const minTotal = 2 * minBoardCells + 2 * minSpaceCells;
      const remainingCells = cellCount - minTotal;
      const firstExtra = Math.floor(rng() * remainingCells);
      const secondExtra = Math.floor(rng() * (remainingCells - firstExtra));
      const thirdExtra = Math.floor(rng() * (remainingCells - firstExtra - secondExtra));
      const fourthExtra = remainingCells - firstExtra - secondExtra - thirdExtra;

      const firstSegmentCells = minBoardCells + firstExtra;
      const secondSegmentCells = minSpaceCells + secondExtra;
      const thirdSegmentCells = minBoardCells + thirdExtra;
      const fourthSegmentCells = minSpaceCells + fourthExtra;

      segments.push({ length: firstSegmentCells, type: 'board', end: randPoint() });
      segments.push({ length: secondSegmentCells, type: 'space' });
      segments.push({ length: thirdSegmentCells, type: 'board', start: randPoint(), end: randPoint() });
      segments.push({ length: fourthSegmentCells, type: 'space' });
    } else {
      const minTotal = 2 * minBoardCells + 2 * minSpaceCells;
      const remainingCells = cellCount - minTotal;
      const firstExtra = Math.floor(rng() * remainingCells);
      const secondExtra = Math.floor(rng() * (remainingCells - firstExtra));
      const thirdExtra = Math.floor(rng() * (remainingCells - firstExtra - secondExtra));
      const fourthExtra = remainingCells - firstExtra - secondExtra - thirdExtra;

      const firstSegmentCells = minSpaceCells + firstExtra;
      const secondSegmentCells = minBoardCells + secondExtra;
      const thirdSegmentCells = minSpaceCells + thirdExtra;
      const fourthSegmentCells = minBoardCells + fourthExtra;

      segments.push({ length: firstSegmentCells, type: 'space' });
      segments.push({ length: secondSegmentCells, type: 'board', start: randPoint(), end: randPoint() });
      segments.push({ length: thirdSegmentCells, type: 'space' });
      segments.push({ length: fourthSegmentCells, type: 'board', start: randPoint() });
    }
  } else if (columnType === 'board-space-board-space-board') {
    // 5 segments
    const minTotal = 3 * minBoardCells + 2 * minSpaceCells;
    const remainingCells = cellCount - minTotal;
    const firstExtra = Math.floor(rng() * remainingCells);
    const secondExtra = Math.floor(rng() * (remainingCells - firstExtra));
    const thirdExtra = Math.floor(rng() * (remainingCells - firstExtra - secondExtra));
    const fourthExtra = Math.floor(rng() * (remainingCells - firstExtra - secondExtra - thirdExtra));
    const fifthExtra = remainingCells - firstExtra - secondExtra - thirdExtra - fourthExtra;

    const firstSegmentCells = minBoardCells + firstExtra;
    const secondSegmentCells = minSpaceCells + secondExtra;
    const thirdSegmentCells = minBoardCells + thirdExtra;
    const fourthSegmentCells = minSpaceCells + fourthExtra;
    const fifthSegmentCells = minBoardCells + fifthExtra;

    segments.push({ length: firstSegmentCells, type: 'board', end: randPoint() });
    segments.push({ length: secondSegmentCells, type: 'space' });
    segments.push({ length: thirdSegmentCells, type: 'board', start: randPoint(), end: randPoint() });
    segments.push({ length: fourthSegmentCells, type: 'space' });
    segments.push({ length: fifthSegmentCells, type: 'board', start: randPoint() });
  }

  return {
    index,
    segments,
    tiles: generateTiles(segments),
  };
}

function generateTiles(segments: Segment[]): string[] {
  const tiles: string[] = [];
  for (const segment of segments) {
    if (segment.type === 'board') {
      for (let i = 0; i < segment.length; i++) {
        if (segment.start && i === 0) {
          tiles.push(`board-up-${segment.start}`);
        } else if (segment.end && i === segment.length - 1) {
          tiles.push(`board-down-${segment.end}`);
        } else {
          tiles.push('board');
        }
      }
    } else {
      for (let i = 0; i < segment.length; i++) {
        tiles.push('space');
      }
    }
  }
  return tiles;
}
