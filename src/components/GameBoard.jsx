import React from 'react';
import Cell from './Cell';
import './GameBoard.css';

const GameBoard = ({ board, score, label }) => {
  return (
    <div className="game-board-container">
      <div className="game-header">
        <h2>{label}</h2>
        <div className="score">Score: {score}</div>
      </div>
      <div className="game-board">
        {board.map((row, y) => (
          <div key={y} className="board-row">
            {row.map((cell, x) => (
              <Cell key={`${y}-${x}`} color={cell} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;