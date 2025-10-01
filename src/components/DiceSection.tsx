'use client';

import styles from './DiceSection.module.css';

interface DiceSectionProps {
  diceValues: [number, number] | null;
  isRolling?: boolean;
}

export default function DiceSection({ diceValues, isRolling = false }: DiceSectionProps) {
  return (
    <div className={styles.diceSection}>
      <div className={styles.diceTitle}>
        {isRolling ? 'Бросаем кости...' : diceValues ? 'Результат броска:' : 'Ожидание броска...'}
      </div>
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
