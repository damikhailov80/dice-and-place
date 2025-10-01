'use client';

import { useState } from 'react';
import styles from './GameBoard.module.css';
import PlayerPanel from './PlayerPanel';

interface Cell {
  id: string;
  x: number;
  y: number;
  player: number | null;
  isSelected: boolean;
}

interface Player {
  id: number;
  name: string;
  isActive: boolean;
  color: string;
}

type Size = ["max", "min"] | ["min", "max"] | ["max", "max"] | ["min", "min"];
type Direction = [-1, 1] | [1, -1] | [1, 1] | [-1, -1];
type FigureShape = {
    size: Size;
    direction: Direction;
  };


interface DragState {
  isDragging: boolean;
  startCell: Cell | null;
  currentCell: Cell | null;
  figureShape: FigureShape | null;
}

const GRID_SIZE = 15;

export default function GameBoard() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', isActive: true, color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
    { id: 2, name: 'Player 2', isActive: false, color: 'linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%)' }
  ]);

  const [cells, setCells] = useState<Cell[]>(() => {
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
  });

  const [diceValues, setDiceValues] = useState<[number, number] | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(1);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startCell: null,
    currentCell: null,
    figureShape: null,
  });

  const handleCellClick = (cellId: string) => {
    if (!diceValues) return;

    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId
          ? { ...cell, player: currentPlayerId, isSelected: false }
          : { ...cell, isSelected: false }
      )
    );
    
    setDiceValues(null);
    switchPlayer();
  };

  const handleCellEnter = (x: number, y: number) => {
    if (!dragState.isDragging) return;

    const { startCell } = dragState;
    const xDiff = x - startCell!.x;
    const yDiff = y - startCell!.y;

    const size: Size = Math.abs(yDiff) > Math.abs(xDiff) ? ["min", "max"] : ["max", "min"];
    const direction: Direction = [
      xDiff === 0 ? 1 : (xDiff > 0 ? 1 : -1), 
      yDiff === 0 ? 1 : (yDiff > 0 ? 1 : -1)
    ] as Direction;
    const figureShape:FigureShape = { size, direction };

    if (figureShape) {
      setDragState({ ...dragState, figureShape });
    }
  };

  const handleDiceRoll = (dice1: number, dice2: number) => {
    setDiceValues([dice1, dice2]);
  };


  const figureShapes: FigureShape[] = [
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
  ]

  const handleMouseDown = (cellId: string, event: React.MouseEvent) => {
    if (!diceValues) return;
    
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    event.preventDefault();
    
    setDragState({
      isDragging: true,
      startCell: cell,
      currentCell: cell,
      figureShape: figureShapes[0],
    });
  };

  const handleMouseUp = () => {
    if (!dragState.isDragging || !dragState.startCell || !dragState.figureShape || !diceValues) {
      setDragState({
        isDragging: false,
        startCell: null,
        currentCell: null,
        figureShape: null,
      });
      return;
    }

    const { startCell, figureShape } = dragState;

    if (canPlaceAtCurrentPosition()) {
      const max = Math.max(diceValues[0], diceValues[1]) - 1;
      const min = Math.min(diceValues[0], diceValues[1]) - 1;
      const xDiff = (figureShape.size[0] === "max" ? max : min) * figureShape.direction[0];
      const yDiff = (figureShape.size[1] === "max" ? max : min) * figureShape.direction[1];
      
      const endX = startCell.x + xDiff;
      const endY = startCell.y + yDiff;
      
      const startX = Math.min(startCell.x, endX);
      const startY = Math.min(startCell.y, endY);
      const width = Math.abs(xDiff) + 1;
      const height = Math.abs(yDiff) + 1;

      setCells(prevCells => {
        const newCells = [...prevCells];
        for (let y = startY; y < startY + height; y++) {
          for (let x = startX; x < startX + width; x++) {
            const cellIndex = newCells.findIndex(c => c.x === x && c.y === y);
            if (cellIndex !== -1) {
              newCells[cellIndex] = {
                ...newCells[cellIndex],
                player: currentPlayerId,
              };
            }
          }
        }
        return newCells;
      });
      
      setDiceValues(null);
      switchPlayer();
    }

    setDragState({
      isDragging: false,
      startCell: null,
      currentCell: null,
      figureShape: null,
    });
  };

  const switchPlayer = () => {
    setCurrentPlayerId(prevId => prevId === 1 ? 2 : 1);
    setPlayers(prevPlayers =>
      prevPlayers.map(player => ({
        ...player,
        isActive: player.id === (currentPlayerId === 1 ? 2 : 1)
      }))
    );
  };

  const currentPlayer = players.find(player => player.id === currentPlayerId);

  const isStartPosition = (x: number, y: number, playerId: number) => {
    if (playerId === 1) {
      return x === 0 && y === 0;
    } else if (playerId === 2) {
      return x === GRID_SIZE - 1 && y === GRID_SIZE - 1;
    }
    return false;
  };


  const isBetween = (num: number, r1: number, r2: number) => {
    const min = Math.min(r1, r2);
    const max = Math.max(r1, r2);
    return num >= min && num <= max;
  }

  const isInSelectedPlaceArea = (x: number, y: number) => {
    if (!dragState.isDragging || !dragState.startCell || !dragState.figureShape) return false;
    
    const { startCell, figureShape } = dragState;
    const max = Math.max(diceValues![0], diceValues![1]) - 1;
    const min = Math.min(diceValues![0], diceValues![1]) - 1;
    const xDiff = (figureShape.size[0] === "max" ? max : min) * figureShape.direction[0];
    const yDiff = (figureShape.size[1] === "max" ? max : min) * figureShape.direction[1];
    

    const result = isBetween(x, startCell.x, startCell.x + xDiff) && 
           isBetween(y, startCell.y, startCell.y + yDiff);

    return result;
  };

  const canPlaceAtCurrentPosition = () => {
    if (!dragState.isDragging || !dragState.startCell || !dragState.figureShape || !diceValues) {
      return false;
    }

    const { startCell, figureShape } = dragState;
    const max = Math.max(diceValues[0], diceValues[1]) - 1;
    const min = Math.min(diceValues[0], diceValues[1]) - 1;
    const xDiff = (figureShape.size[0] === "max" ? max : min) * figureShape.direction[0];
    const yDiff = (figureShape.size[1] === "max" ? max : min) * figureShape.direction[1];
    
    const endX = startCell.x + xDiff;
    const endY = startCell.y + yDiff;
    
    if (endX >= GRID_SIZE || endY >= GRID_SIZE || endX < 0 || endY < 0) {
      return false;
    }

    const startX = Math.min(startCell.x, endX);
    const startY = Math.min(startCell.y, endY);
    const width = Math.abs(xDiff) + 1;
    const height = Math.abs(yDiff) + 1;

    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        const cell = cells.find(c => c.x === x && c.y === y);
        if (cell && cell.player !== null) {
          return false;
        }
      }
    }
    
    return true;
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameContent}>
        <div className={styles.leftSection}>
          <h1 className={styles.gameTitle}>Dice and Place</h1>
          
          <div 
            className={`${styles.gameBoard} ${dragState.isDragging ? styles.dragging : ''}`}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {cells.map((cell) => {
              const isPlayer1Start = isStartPosition(cell.x, cell.y, 1);
              const isPlayer2Start = isStartPosition(cell.x, cell.y, 2);
              const isInSelectedPlace = isInSelectedPlaceArea(cell.x, cell.y);
              const canPlace = canPlaceAtCurrentPosition();
              
              return (
                <div
                  key={cell.id}
                  className={`${styles.cell} ${
                    cell.player ? styles.filled : ''
                  } ${cell.isSelected ? styles.selected : ''} ${
                    cell.player === 1 ? styles.player1 : cell.player === 2 ? styles.player2 : ''
                  } 
                  ${isPlayer1Start ? styles.possiblePosition1 : ''}
                  ${isPlayer2Start ? styles.possiblePosition2 : ''}
                   ${
                    isInSelectedPlace ? (canPlace ? 
                      (currentPlayerId === 1 ? styles.placeAreaValidPlayer1 : styles.placeAreaValidPlayer2) : 
                      styles.placeAreaInvalid) : ''
                  }`}
                  onClick={() => handleCellClick(cell.id)}
                  onMouseEnter={() => handleCellEnter(cell.x, cell.y)}
                  onMouseDown={(e) => handleMouseDown(cell.id, e)}
                >
                </div>
              );
            })}
          </div>
        </div>
        
        <PlayerPanel 
          players={players}
          onDiceRoll={handleDiceRoll}
          diceValues={diceValues}
        />
      </div>
    </div>
  );
}
