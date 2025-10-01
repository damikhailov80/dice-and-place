'use client';

import styles from './DiceSection.module.css';

interface DiceSectionProps {
  onDiceRoll: (dice1: number, dice2: number) => void;
  diceValues: [number, number] | null;
}

export default function DiceSection({ onDiceRoll, diceValues }: DiceSectionProps) {
  const rollDice = () => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    onDiceRoll(dice1, dice2);
  };

  return (
    <div className={styles.diceSection}>
      <button 
        className={styles.diceButton} 
        onClick={rollDice}
        disabled={!!diceValues}
      >
        Roll Dice
      </button>
      {diceValues && (
        <div className={styles.diceValues}>
          <div className={styles.diceContainer}>
            <div className={styles.dice}>
              <span className={styles.diceValue}>{diceValues[0]}</span>
            </div>
            <div className={styles.dice}>
              <span className={styles.diceValue}>{diceValues[1]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
