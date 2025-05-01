import seedrandom from 'seedrandom';
import { type Column, getColumn } from './get-column';

export interface Grid {
	rowCount: number;
	columnCount: number;
	columns: Column[];
}

export function generateGrid(seed: number, columnCount: number, rowCount: number): Grid {
	const rng = seedrandom(seed.toString());

	const columns: Column[] = [];
	for (let i = 0; i < columnCount; i++) {
		columns.push(getColumn(rng, i, rowCount));
	}

	return {
		rowCount,
		columnCount,
		columns,
	};
}
