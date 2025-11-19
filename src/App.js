import React, { useEffect } from 'react';
import BattleArena from './components/BattleArena';
import { useTetris } from './hooks/useTetris';
import './App.css';

function App() {
  // Hook pour le joueur
  const player = useTetris(false);
  
  // Hook pour l'AI
  const ai = useTetris(true);

  // Gravity pour le joueur - descend automatiquement
  useEffect(() => {
    if (player.gameOver) return;
    
    const interval = setInterval(() => {
      player.drop();
    }, 1000); // Descend toutes les secondes
    
    return () => clearInterval(interval);
  }, [player]);

  // Gravity pour l'AI
  useEffect(() => {
    if (ai.gameOver) return;
    
    const interval = setInterval(() => {
      ai.drop();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [ai]);

  // Gestion du clavier pour le joueur
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (player.gameOver) return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          player.moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.moveRight();
          break;
        case 'ArrowUp':
          e.preventDefault();
          player.rotate();
          break;
        case 'ArrowDown':
          e.preventDefault();
          player.drop();
          break;
        case ' ':
          e.preventDefault();
          player.hardDrop();  // Hard drop avec Espace
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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