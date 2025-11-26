import React, { useEffect, useRef } from 'react';
import BattleArena from './components/BattleArena';
import { useTetris } from './hooks/useTetris';
import './App.css';

function App() {
  const player = useTetris(false);
  const ai = useTetris(true);
  
  const moveIntervalRef = useRef(null);
  const dropIntervalRef = useRef(null);

  // Gravity - 2x faster than before
  useEffect(() => {
    if (player.gameOver) return;
    
    const interval = setInterval(() => {
      player.drop(false);
    },90); // 
    
    return () => clearInterval(interval);
  }, [player]);

  // Smooth keyboard controls with auto-repeat
  useEffect(() => {
    if (player.gameOver) return;

    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      // Prevent default for arrow keys and space
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Ignore if key is already pressed (browser repeat)
      pressedKeys.add(e.key);

      switch(e.key) {
        case 'ArrowLeft':
          player.moveLeft();
          // Start auto-repeat after initial press
          moveIntervalRef.current = setInterval(() => {
            player.moveLeft();
          }, 50); // repeat every 50ms
          break;
        case 'ArrowRight':
          player.moveRight();
          moveIntervalRef.current = setInterval(() => {
            player.moveRight();
          }, 50);
          break;
        case 'ArrowUp':
          player.rotate();
          break;
        case 'ArrowDown':
          player.drop(true);
          dropIntervalRef.current = setInterval(() => {
            player.drop(true);
          }, 50); // fast drop
          break;
        case ' ':
          player.hardDrop();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      pressedKeys.delete(e.key);
      
      // Clear intervals when key is released
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (moveIntervalRef.current) {
          clearInterval(moveIntervalRef.current);
          moveIntervalRef.current = null;
        }
      }
      
      if (e.key === 'ArrowDown') {
        if (dropIntervalRef.current) {
          clearInterval(dropIntervalRef.current);
          dropIntervalRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
      if (dropIntervalRef.current) clearInterval(dropIntervalRef.current);
    };
  }, [player]);

  return (
    <div className="App">
      <BattleArena
        playerBoard={player.board}
        playerScore={player.score}
        aiBoard={ai.board}
        aiScore={ai.score}
      />
    </div>
  );
}

export default App;