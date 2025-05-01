import type { Grid } from '@/app/lib/generate-grid';
import type { FormValues } from './sidebar';

export function Preview({ grid, formValues }: { grid: Grid, formValues: FormValues }) {
  const { width, height, spacing, boardWidth } = formValues;
  const { rowCount, columnCount, columns } = grid;
  const left = (width - (columnCount * boardWidth) - ((columnCount - 1) * spacing)) / 2;
  const baseboardHeight = 5.5;
  const startHeight = 0.75;
  const tileHeight = (height - (baseboardHeight + 0.75 + 0.75)) / rowCount;

  return (
    <div>
      <h1>Preview</h1>
      <div className="p-1 bg-white">
        <svg
          width="1024"
          height={1024 * (height/width)}
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg">
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            fill="gray"
          />
          <rect
              x="0"
              y={height - baseboardHeight}
              width={width}
              height={baseboardHeight}
              fill="black"
          />
          {columns.flatMap((column, i) => {
            let y = startHeight;

            return column.segments.flatMap((segment, j) => {
              const top = y;
              y += segment.length * tileHeight;

              if (segment.type === 'board') {
                // 0,0 is the top left

                const box = [
                  // top left
                  { x: left + (i * (boardWidth + spacing)), y: top - (segment.start === 'left' ? tileHeight : 0) },
                  // bottom left
                  { x: left + (i * (boardWidth + spacing)), y: top + (segment.length * tileHeight) - (segment.end === 'right' ? tileHeight : 0) },
                  // bottom right
                  { x: left + (i * (boardWidth + spacing)) + boardWidth, y: top + (segment.length * tileHeight) - (segment.end === 'left' ? tileHeight : 0) },
                  // top right
                  { x: left + (i * (boardWidth + spacing)) + boardWidth, y: top - (segment.start === 'right' ? tileHeight : 0) },
                ];

                let path = `M ${box[0].x},${box[0].y}
                  L ${box[1].x},${box[1].y}
                  L ${box[2].x},${box[2].y}
                  L ${box[3].x},${box[3].y}
                  Z`;

                return (
                  <path
                    key={`board-${i}-${j}`}
                    d={path}
                    fill="black"
                  />
                );
              }

              // space
              return null;
            });
          })}
          {columns.map((column, i) => {
            return (
              <text
                key={`column-${i}`}
                x={left + (i * (boardWidth + spacing)) + (boardWidth / 2)}
                y={height - 3}
                fill="gray"
                fontSize="1.5"
                textAnchor="middle"
              >{i + 1}</text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
