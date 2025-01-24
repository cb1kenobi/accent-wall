import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seed = parseFloat(searchParams.get('seed') || '666');
  const width = parseFloat(searchParams.get('width') || '153.25');
  const height = parseFloat(searchParams.get('height') || '90');
  const boardSpacing = parseFloat(searchParams.get('spacing') || '.75');
  const boardWidth = parseFloat(searchParams.get('boardWidth') || '2.75');
  const numberOfBoards = Math.floor((width + boardSpacing) / (boardWidth + boardSpacing));
  const left = (width - (numberOfBoards * boardWidth) - ((numberOfBoards - 1) * boardSpacing)) / 2;

  const randomNumber = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const getSegmentType = () => {
    const rand = Math.random();
    if (rand < 0.1) return 'bottom';
    if (rand < 0.2) return 'top';
    return 'middle';
  };

  const getPointType = (isFirst: boolean, isLast: boolean) => {
    const rand = Math.random();
    if (rand < 0.48 && !isLast) return 'left';
    if (rand < 0.96 && !isFirst) return 'right';
    return 'none';
  };

  const getSegments = (segmentType: string) => {
    if (segmentType === 'bottom') {
	  const bottom = height * randomNumber(0.1, 0.3);
      return [
        {
          type: 'bottom',
          length: height - bottom,
        },
        {
          type: 'gap',
          length: bottom,
        },
      ];
    }

    if (segmentType === 'top') {
      const top = height * randomNumber(0.1, 0.3);
      return [
        {
          type: 'gap',
          length: top,
        },
        {
          type: 'top',
          length: height - top,
        },
      ];
    }

    if (segmentType === 'middle') {
      const middle = height * randomNumber(0.1, 0.3);
      const top = (height - middle) * randomNumber(.25, .75);
      return [
        {
          type: 'bottom',
          length: top,
        },
        {
          type: 'gap',
          length: middle,
        },
        {
          type: 'top',
          length: height - top - middle,
        },
      ];
    }

    return [
      {
        type: 'top',
        length: height,
      },
    ];
  };

  const boards = Array(numberOfBoards).fill(0).map((_, i) => {
    const segmentType = getSegmentType();
    const r = {
      left: left + i * (boardWidth + boardSpacing),
      width: boardWidth,
      segmentType,
      segments: getSegments(segmentType),
    };

    return r;
  });

  console.log(JSON.stringify({
    seed,
    numberOfBoards,
    width,
	  height,
    boardSpacing,
    boardWidth,
    // boards
  }, null, 2));

  const svg = `<svg
    width="1024"
    height="${1024 * (height/width)}"
    viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg">
    <rect
      x="0"
      y="0"
      width="${width}"
      height="${height}"
      fill="gray"
    />
    ${boards.map((board, i) => {
      let y = 0;
      const isFirst = i === 0;
      const isLast = i === boards.length - 1;

      return board.segments.map((segment) => {
        if (segment.type === 'gap') {
          y += segment.length;
          return '';
        }

        let path;
        const pointType = getPointType(isFirst, isLast);
        if (segment.type === 'top') {
          path = `<path
              d="M ${board.left},0
                L ${board.left},0
                L ${board.left + board.width},0
                L ${board.left + board.width},${pointType === 'left' ? segment.length - board.width : segment.length}
                L ${board.left},${pointType === 'left' ? segment.length : segment.length - board.width}
                Z"
            fill="red"
          />`;
        } else if (segment.type === 'bottom') {
          path = `<path
            d="M ${board.left},${height}
              L ${board.left},${height}
              L ${board.left + board.width},${height}
              L ${board.left + board.width},${height - (pointType === 'left' ? segment.length - board.width : segment.length)}
              L ${board.left},${height - (pointType === 'left' ? segment.length : segment.length - board.width)}
              Z"
            fill="blue"
          />`;
        }

        y += segment.length;
        return path;
      }).join('')
    }).join('')}w
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}

