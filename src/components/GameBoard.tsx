'use client';

import { useState } from 'react';
import styles from './GameBoard.module.css';
import PlayerPanel from './PlayerPanel';

interface Cell {
  id: string;
  row: number;
  col: number;
  value: number | null;
  player: number | null;
  isSelected: boolean;
}

interface Player {
  id: number;
  name: string;
  isActive: boolean;
  color: string;
}

const GRID_SIZE = 15;

export default function GameBoard() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', isActive: true, color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
    { id: 2, name: 'Player 2', isActive: false, color: 'linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%)' }
  ]);

  const [cells, setCells] = useState<Cell[]>(() => {
    const initialCells: Cell[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        initialCells.push({
          id: `${row}-${col}`,
          row,
          col,
          value: null,
          player: null,
          isSelected: false,
        });
      }
    }
    return initialCells;
  });

  const [diceValues, setDiceValues] = useState<[number, number] | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(1);

  const handleCellClick = (cellId: string) => {
    if (!diceValues) return;

    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId
          ? { ...cell, value: diceValues[0] + diceValues[1], player: currentPlayerId, isSelected: false }
          : { ...cell, isSelected: false }
      )
    );
    
    setDiceValues(null);
    switchPlayer();
  };

  const handleCellHover = (cellId: string) => {
    if (!diceValues) return;

    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId
          ? { ...cell, isSelected: true }
          : { ...cell, isSelected: false }
      )
    );
  };

  const handleDiceRoll = (dice1: number, dice2: number) => {
    setDiceValues([dice1, dice2]);
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

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameContent}>
        <div className={styles.leftSection}>
          <h1 className={styles.gameTitle}>Dice and Place</h1>
          
          <div className={styles.gameBoard}>
            {cells.map((cell) => (
              <div
                key={cell.id}
                className={`${styles.cell} ${
                  cell.value ? styles.filled : ''
                } ${cell.isSelected ? styles.selected : ''} ${
                  cell.player === 1 ? styles.player1 : cell.player === 2 ? styles.player2 : ''
                }`}
                onClick={() => handleCellClick(cell.id)}
                onMouseEnter={() => handleCellHover(cell.id)}
              >
                {cell.value && (
                  <span className={styles.cellValue}>{cell.value}</span>
                )}
              </div>
            ))}
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
