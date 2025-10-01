'use client';

import { useState } from 'react';
import styles from './GameBoard.module.css';
import PlayerPanel from './PlayerPanel';
import {
  Cell,
  Player,
  PlaceState,
  FigureShape,
  figureShapes,
  isStartPosition,
  isInSelectedPlaceArea,
  canPlaceAtCurrentPosition,
  calculatePlacementArea,
  createInitialCells
} from '../utils/gameLogic';

export default function GameBoard() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', isActive: true, color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
    { id: 2, name: 'Player 2', isActive: false, color: 'linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%)' }
  ]);

  const [cells, setCells] = useState<Cell[]>(() => createInitialCells());

  const [diceValues, setDiceValues] = useState<[number, number] | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(1);
  const [placeState, setPlaceState] = useState<PlaceState>({
    isPlacing: false,
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
    if (!placeState.isPlacing) return;

    const { startCell } = placeState;
    const xDiff = x - startCell!.x;
    const yDiff = y - startCell!.y;

    const size = Math.abs(yDiff) > Math.abs(xDiff) ? ["min", "max"] as const : ["max", "min"] as const;
    const direction = [
      xDiff === 0 ? 1 : (xDiff > 0 ? 1 : -1), 
      yDiff === 0 ? 1 : (yDiff > 0 ? 1 : -1)
    ] as const;
    const figureShape:FigureShape = { size, direction };

    if (figureShape) {
      setPlaceState({ ...placeState, figureShape });
    }
  };

  const handleDiceRoll = (dice1: number, dice2: number) => {
    setDiceValues([dice1, dice2]);
  };



  const handleMouseDown = (cellId: string, event: React.MouseEvent) => {
    if (!diceValues) return;
    
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    event.preventDefault();
    
    setPlaceState({
      isPlacing: true,
      startCell: cell,
      currentCell: cell,
      figureShape: figureShapes[0],
    });
  };

  const handleMouseUp = () => {
    if (!placeState.isPlacing || !placeState.startCell || !placeState.figureShape || !diceValues) {
      setPlaceState({
        isPlacing: false,
        startCell: null,
        currentCell: null,
        figureShape: null,
      });
      return;
    }

    const { startCell, figureShape } = placeState;

    if (canPlaceAtCurrentPosition(placeState, diceValues, cells)) {
      const { startX, startY, width, height } = calculatePlacementArea(startCell, diceValues, figureShape);

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

    setPlaceState({
      isPlacing: false,
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


  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameContent}>
        <div className={styles.leftSection}>
          <h1 className={styles.gameTitle}>Dice and Place</h1>
          
          <div 
            className={`${styles.gameBoard} ${placeState.isPlacing ? styles.placing : ''}`}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {cells.map((cell) => {
              const isPlayer1Start = isStartPosition(cell.x, cell.y, 1);
              const isPlayer2Start = isStartPosition(cell.x, cell.y, 2);
              const isInSelectedPlace = isInSelectedPlaceArea(cell.x, cell.y, placeState, diceValues);
              const canPlace = canPlaceAtCurrentPosition(placeState, diceValues, cells);
              
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
