'use client';

import { useState, useEffect } from 'react';
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
  createInitialCells,
  canPlayerPlaceAnyFigure,
  getGameWinner
} from '../utils/gameLogic';

export default function GameBoard() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Player 1', isActive: true, color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
    { id: 2, name: 'Player 2', isActive: false, color: 'linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%)' }
  ]);

  const [cells, setCells] = useState<Cell[]>(() => createInitialCells());

  const [diceValues, setDiceValues] = useState<[number, number] | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(1);
  const [placeState, setPlaceState] = useState<PlaceState>({
    isPlacing: false,
    startCell: null,
    currentCell: null,
    figureShape: null,
  });
  const [gameState, setGameState] = useState<{
    isGameOver: boolean;
    winner: number | null;
  }>({
    isGameOver: false,
    winner: null,
  });

  const handleCellClick = (cellId: string) => {
    if (!diceValues || gameState.isGameOver) return;

    setCells(prevCells =>
      prevCells.map(cell =>
        cell.id === cellId
          ? { ...cell, player: currentPlayerId, isSelected: false }
          : { ...cell, isSelected: false }
      )
    );
    
    if (!checkGameEnd(currentPlayerId, diceValues)) {
      switchPlayer();
    }
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

  const autoRollDice = () => {
    setIsRolling(true);
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      setDiceValues([dice1, dice2]);
      setIsRolling(false);
    }, 1500);
  };

  useEffect(() => {
    if (!diceValues && !isRolling && !gameState.isGameOver) {
      const timer = setTimeout(() => {
        autoRollDice();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayerId, diceValues, isRolling, gameState.isGameOver]);

  useEffect(() => {
    if (diceValues && !gameState.isGameOver) {
      if (!canPlayerPlaceAnyFigure(currentPlayerId, diceValues, cells)) {
        const winner = getGameWinner(cells);
        setGameState({
          isGameOver: true,
          winner
        });
      }
    }
  }, [diceValues, currentPlayerId, cells, gameState.isGameOver]);



  const handleMouseDown = (cellId: string, event: React.MouseEvent) => {
    if (!diceValues || gameState.isGameOver) return;
    
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    const isCurrentPlayerStartPosition = isStartPosition(cell.x, cell.y, currentPlayerId, cells);
    if (!isCurrentPlayerStartPosition) return;

    event.preventDefault();
    
    setPlaceState({
      isPlacing: true,
      startCell: cell,
      currentCell: cell,
      figureShape: figureShapes[0],
    });
  };

  const handleMouseUp = () => {
    if (!placeState.isPlacing || !placeState.startCell || !placeState.figureShape || !diceValues || gameState.isGameOver) {
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
      
      if (!checkGameEnd(currentPlayerId, diceValues)) {
        switchPlayer();
      }
    }

    setPlaceState({
      isPlacing: false,
      startCell: null,
      currentCell: null,
      figureShape: null,
    });
  };

  const checkGameEnd = (playerId: number, diceValues: [number, number]) => {
    if (!canPlayerPlaceAnyFigure(playerId, diceValues, cells)) {
      const winner = getGameWinner(cells);
      setGameState({
        isGameOver: true,
        winner
      });
      return true;
    }
    return false;
  };

  const switchPlayer = () => {
    if (gameState.isGameOver) return;
    
    setDiceValues(null);
    const nextPlayerId = currentPlayerId === 1 ? 2 : 1;
    setCurrentPlayerId(nextPlayerId);
    setPlayers(prevPlayers =>
      prevPlayers.map(player => ({
        ...player,
        isActive: player.id === nextPlayerId
      }))
    );
  };

  const getCellClassName = (cell: Cell) => {
    const isInSelectedPlace = isInSelectedPlaceArea(cell.x, cell.y, placeState, diceValues);
    const canPlace = canPlaceAtCurrentPosition(placeState, diceValues, cells);

    const baseClasses = [styles.cell];
    
    if (cell.player) baseClasses.push(styles.filled);
    if (cell.isSelected) baseClasses.push(styles.selected);
    if (isInSelectedPlace) {
        if (canPlace) {
          baseClasses.push(currentPlayerId === 1 ? styles.placeAreaValidPlayer1 : styles.placeAreaValidPlayer2);
        } else {
          baseClasses.push(styles.placeAreaInvalid);
        }
        return baseClasses.join(' ');
    }
    if (cell.player === 1) {
        baseClasses.push(styles.player1);
        return baseClasses.join(' ');
    }
    if (cell.player === 2) {
        baseClasses.push(styles.player2);
        return baseClasses.join(' ');
    }
    
    // Показываем стартовые позиции только для текущего игрока
    if (currentPlayerId === 1) {
      const isPlayer1StartPosition = isStartPosition(cell.x, cell.y, 1, cells);
      if (isPlayer1StartPosition) baseClasses.push(styles.possiblePosition1);
    } else if (currentPlayerId === 2) {
      const isPlayer2StartPosition = isStartPosition(cell.x, cell.y, 2, cells);
      if (isPlayer2StartPosition) baseClasses.push(styles.possiblePosition2);
    }

    return baseClasses.join(' ');
  };


  const resetGame = () => {
    setCells(createInitialCells());
    setDiceValues(null);
    setIsRolling(false);
    setCurrentPlayerId(1);
    setPlaceState({
      isPlacing: false,
      startCell: null,
      currentCell: null,
      figureShape: null,
    });
    setGameState({
      isGameOver: false,
      winner: null,
    });
    setPlayers([
      { id: 1, name: 'Player 1', isActive: true, color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' },
      { id: 2, name: 'Player 2', isActive: false, color: 'linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%)' }
    ]);
  };

  if (gameState.isGameOver) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.gameOverScreen}>
          <h1 className={styles.gameOverTitle}>Игра окончена!</h1>
          <div className={styles.winnerMessage}>
            {gameState.winner ? (
              <>
                <h2>Победитель: Игрок {gameState.winner}</h2>
                <div className={styles.winnerColor} style={{ background: players.find(p => p.id === gameState.winner)?.color }}></div>
              </>
            ) : (
              <h2>Ничья!</h2>
            )}
          </div>
          <button className={styles.resetButton} onClick={resetGame}>
            Новая игра
          </button>
        </div>
      </div>
    );
  }

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
            {cells.map((cell) => (
              <div
                key={cell.id}
                className={getCellClassName(cell)}
                onClick={() => handleCellClick(cell.id)}
                onMouseEnter={() => handleCellEnter(cell.x, cell.y)}
                onMouseDown={(e) => handleMouseDown(cell.id, e)}
              >
              </div>
            ))}
          </div>
        </div>
        
        <PlayerPanel 
          players={players}
          diceValues={diceValues}
          isRolling={isRolling}
        />
      </div>
    </div>
  );
}
