'use client';

import seedrandom from 'seedrandom';

interface Segment {
  length: number;
  type: 'board' | 'space';
  start?: 'left' | 'right';
  end?: 'left' | 'right';
}

export interface Column {
  index: number;
  columnType: string;
  segments: Segment[];
  tiles: string[];
}

const columnTypes = [
  'board-space',
  'space-board',
  'board-space-board',
  'space-board-space',
  'board-space-board-space',
  'space-board-space-board',
  'board-space-board-space-board',
];

export function getColumn(rng: seedrandom.PRNG, index: number, cellCount: number): Column {
  const columnType = columnTypes[Math.floor(rng() * columnTypes.length)];
  const segments: Segment[] = [];
  const randPoint = () => { return Math.round(rng()) === 0 ? 'left' : 'right' };
  const minBoardCells = 4;
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
        tiles.push('blank');
      }
    }
  }

  return {
    index,
    columnType,
    segments,
    tiles,
  };
}
