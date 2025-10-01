'use client';

import styles from './PlayerPanel.module.css';
import Player from './Player';
import DiceSection from './DiceSection';

interface Player {
  id: number;
  name: string;
  isActive: boolean;
  color: string;
}

interface PlayerPanelProps {
  players: Player[];
  onDiceRoll: (dice1: number, dice2: number) => void;
  diceValues: [number, number] | null;
}

export default function PlayerPanel({ players, onDiceRoll, diceValues }: PlayerPanelProps) {
  return (
    <div className={styles.playerPanel}>
      <div className={styles.playersSection}>
        <h3 className={styles.playersTitle}>Players</h3>
        <div className={styles.playersList}>
          {players.map((player) => (
            <Player
              key={player.id}
              id={player.id}
              name={player.name}
              isActive={player.isActive}
              color={player.color}
            />
          ))}
        </div>
      </div>
      
      <DiceSection 
        onDiceRoll={onDiceRoll}
        diceValues={diceValues}
      />
    </div>
  );
}
