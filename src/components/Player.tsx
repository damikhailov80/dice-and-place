'use client';

import styles from './Player.module.css';

interface PlayerProps {
  id: number;
  name: string;
  isActive: boolean;
  color: string;
}

export default function Player({ id, name, isActive, color }: PlayerProps) {
  return (
    <div 
      className={`${styles.playerCard} ${isActive ? styles.activePlayer : ''}`}
      style={{ '--player-color': color } as React.CSSProperties}
    >
      <div className={styles.playerName}>{name}</div>
      <div className={styles.indicatorContainer}>
        {isActive && (
          <div className={styles.activeIndicator}>Turn</div>
        )}
      </div>
    </div>
  );
}
