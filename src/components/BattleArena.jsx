import React from 'react';
import GameBoard from './GameBoard';
import './BattleArena.css';

const BattleArena = ({ playerBoard, playerScore, aiBoard, aiScore }) => {
  return (
    <div className="battle-arena">
      <h1 className="title">TETRIS AI BATTLE</h1>
      <div className="boards-container">
        <GameBoard 
          board={playerBoard} 
          score={playerScore} 
          label="YOU" 
        />
        <div className="vs-divider">VS</div>
        <GameBoard 
          board={aiBoard} 
          score={aiScore} 
          label="AI" 
        />
      </div>
    </div>
  );
};

export default BattleArena;