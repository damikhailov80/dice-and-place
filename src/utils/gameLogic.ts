export interface Cell {
  id: string;
  x: number;
  y: number;
  player: number | null;
  isSelected: boolean;
}

export interface Player {
  id: number;
  name: string;
  isActive: boolean;
  color: string;
}

export type Size = readonly ["max", "min"] | readonly ["min", "max"] | readonly ["max", "max"] | readonly ["min", "min"];
export type Direction = readonly [-1, 1] | readonly [1, -1] | readonly [1, 1] | readonly [-1, -1];

export interface FigureShape {
  size: Size;
  direction: Direction;
}

export interface PlaceState {
  isPlacing: boolean;
  startCell: Cell | null;
  currentCell: Cell | null;
  figureShape: FigureShape | null;
}

export const GRID_SIZE = 15;

export const figureShapes: FigureShape[] = [
  {
    size: ["min", "max"],
    direction: [1, -1]
  },
  {
    size: ["max", "min"],
    direction: [1, -1]
  },
  {
    size: ["max", "min"],
    direction: [1, 1]
  },
  {
    size: ["min", "max"],
    direction: [1, 1]
  },
  {   
    size: ["min", "max"],
    direction: [1, -1]
  },
  {
    size: ["max", "min"],
    direction: [1, -1]
  },
  {
    size: ["max", "min"],
    direction: [-1, -1]
  },
  {
    size: ["min", "max"],
    direction: [-1, -1]
  }
];

export const isBetween = (num: number, r1: number, r2: number): boolean => {
  const min = Math.min(r1, r2);
  const max = Math.max(r1, r2);
  return num >= min && num <= max;
};

export const isStartPosition = (x: number, y: number, playerId: number, cells: Cell[]): boolean => {
  if (playerId === 1) {
    if (x === 0 && y === 0) return true;
  } else if (playerId === 2) {
    if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) return true;
  }

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [dx, dy] of directions) {
    const neighborX = x + dx;
    const neighborY = y + dy;
    
    if (neighborX >= 0 && neighborX < GRID_SIZE && neighborY >= 0 && neighborY < GRID_SIZE) {
      const neighborCell = cells.find(cell => cell.x === neighborX && cell.y === neighborY);
      if (neighborCell && neighborCell.player === playerId) {
        return true;
      }
    }
  }

  return false;
};

export const calculateFigureDimensions = (
  diceValues: [number, number],
  figureShape: FigureShape
) => {
  const max = Math.max(diceValues[0], diceValues[1]) - 1;
  const min = Math.min(diceValues[0], diceValues[1]) - 1;
  const xDiff = (figureShape.size[0] === "max" ? max : min) * figureShape.direction[0];
  const yDiff = (figureShape.size[1] === "max" ? max : min) * figureShape.direction[1];
  
  return { xDiff, yDiff };
};

export const isInSelectedPlaceArea = (
  x: number, 
  y: number, 
  placeState: PlaceState, 
  diceValues: [number, number] | null
): boolean => {
  if (!placeState.isPlacing || !placeState.startCell || !placeState.figureShape || !diceValues) {
    return false;
  }
  
  const { startCell, figureShape } = placeState;
  const { xDiff, yDiff } = calculateFigureDimensions(diceValues, figureShape);
  
  return isBetween(x, startCell.x, startCell.x + xDiff) && 
         isBetween(y, startCell.y, startCell.y + yDiff);
};

export const canPlaceAtCurrentPosition = (
  placeState: PlaceState,
  diceValues: [number, number] | null,
  cells: Cell[]
): boolean => {
  if (!placeState.isPlacing || !placeState.startCell || !placeState.figureShape || !diceValues) {
    return false;
  }

  const { startCell, figureShape } = placeState;
  const { xDiff, yDiff } = calculateFigureDimensions(diceValues, figureShape);
  
  const endX = startCell.x + xDiff;
  const endY = startCell.y + yDiff;
  
  if (!isBetween(endX, 0, GRID_SIZE - 1) || !isBetween(endY, 0, GRID_SIZE - 1)) {
    return false;
  }

  const startX = Math.min(startCell.x, endX);
  const startY = Math.min(startCell.y, endY);
  const width = Math.abs(xDiff) + 1;
  const height = Math.abs(yDiff) + 1;

  for (let y = startY; y < startY + height; y++) {
    for (let x = startX; x < startX + width; x++) {
      const cellIndex = y * GRID_SIZE + x;
      if (cells[cellIndex]?.player !== null) {
        return false;
      }
    }
  }
  
  return true;
};

export const calculatePlacementArea = (
  startCell: Cell,
  diceValues: [number, number],
  figureShape: FigureShape
) => {
  const { xDiff, yDiff } = calculateFigureDimensions(diceValues, figureShape);
  
  const endX = startCell.x + xDiff;
  const endY = startCell.y + yDiff;
  
  const startX = Math.min(startCell.x, endX);
  const startY = Math.min(startCell.y, endY);
  const width = Math.abs(xDiff) + 1;
  const height = Math.abs(yDiff) + 1;

  return { startX, startY, width, height, endX, endY };
};


export const createInitialCells = (): Cell[] => {
  const initialCells: Cell[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      initialCells.push({
        id: `${x}-${y}`,
        x,
        y,
        player: null,
        isSelected: false,
      });
    }
  }
  return initialCells;
};
