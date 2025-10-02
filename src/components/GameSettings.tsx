'use client';

import { useState } from 'react';
import styles from './GameSettings.module.css';
import { GridSize } from '../utils/gameLogic';

interface GameSettingsProps {
  currentGridSize: GridSize;
  onGridSizeChange: (size: GridSize) => void;
  onResetGame: () => void;
}

export default function GameSettings({ currentGridSize, onGridSizeChange, onResetGame }: GameSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleGridSizeChange = (size: GridSize) => {
    onGridSizeChange(size);
    setIsOpen(false);
  };

  const handleResetGame = () => {
    onResetGame();
    setIsOpen(false);
  };

  return (
    <div className={styles.settingsContainer}>
      <button 
        className={styles.settingsButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Настройки игры"
      >
        ⚙️
      </button>
      
      {isOpen && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsHeader}>
            <h3>Настройки игры</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть настройки"
            >
              ✕
            </button>
          </div>
          
          <div className={styles.settingsContent}>
            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>Размер поля:</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="gridSize"
                    value="10"
                    checked={currentGridSize === 10}
                    onChange={() => handleGridSizeChange(10)}
                  />
                  <span>10 × 10</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="gridSize"
                    value="15"
                    checked={currentGridSize === 15}
                    onChange={() => handleGridSizeChange(15)}
                  />
                  <span>15 × 15</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="gridSize"
                    value="20"
                    checked={currentGridSize === 20}
                    onChange={() => handleGridSizeChange(20)}
                  />
                  <span>20 × 20</span>
                </label>
              </div>
            </div>
            
            <button 
              className={styles.resetButton}
              onClick={handleResetGame}
            >
              Новая игра
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
