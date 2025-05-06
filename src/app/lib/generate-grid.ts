import seedrandom from 'seedrandom';
import { type Column, getColumn } from './get-column';

export interface Grid {
	columnCount: number;
	columns: Column[];
	rowCount: number;
	seed?: number;
}

export function generateGrid(seed: number, columnCount: number, rowCount: number): Grid {
	const rng = seedrandom(seed.toString());

	const columns: Column[] = [];
	for (let i = 0; i < columnCount; i++) {
		columns.push(getColumn(rng, i, rowCount));
	}

	return {
		columnCount,
		columns,
		rowCount,
		seed,
	};
}
