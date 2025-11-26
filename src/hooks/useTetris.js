import { useState, useCallback, useEffect } from 'react';
import { PIECES, PIECE_TYPES } from '../constants/pieces';
import { canPlacePiece, mergePieceToBoard, clearLines } from '../utils/gameLogic';
import { findBestMove } from '../utils/aiMoves';


const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

const randomPiece = () => {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return {
    type,
    shape: PIECES[type].shape[0],
    color: PIECES[type].color,
    rotation: 0,
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0
  };
};

export const useTetris = (isAI = false) => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(randomPiece());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Déplace à gauche
  const moveLeft = useCallback(() => {
    if (gameOver) return;
    if (canPlacePiece(board, currentPiece, currentPiece.x - 1, currentPiece.y)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [board, currentPiece, gameOver]);

  // Déplace à droite
  const moveRight = useCallback(() => {
    if (gameOver) return;
    if (canPlacePiece(board, currentPiece, currentPiece.x + 1, currentPiece.y)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [board, currentPiece, gameOver]);

  // Rotation
  const rotate = useCallback(() => {
    if (gameOver) return;
    const pieceData = PIECES[currentPiece.type];
    const nextRotation = (currentPiece.rotation + 1) % pieceData.shape.length;
    const nextShape = pieceData.shape[nextRotation];
    
    if (canPlacePiece(board, { ...currentPiece, shape: nextShape }, currentPiece.x, currentPiece.y)) {
      setCurrentPiece(prev => ({
        ...prev,
        shape: nextShape,
        rotation: nextRotation
      }));
    }
  }, [board, currentPiece, gameOver]);

  // Drop rapide
  const drop = useCallback(() => {
    if (gameOver) return;
    if (canPlacePiece(board, currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      // Lock la pièce
      const newBoard = mergePieceToBoard(board, currentPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);
      
      // Nouvelle pièce
      const nextPiece = randomPiece();
      if (!canPlacePiece(clearedBoard, nextPiece, nextPiece.x, nextPiece.y)) {
        setGameOver(true);
      } else {
        setCurrentPiece(nextPiece);
      }
    }
  }, [board, currentPiece, gameOver]);

  // Hard drop - tombe direct en bas
  const hardDrop = useCallback(() => {
    if (gameOver) return;
    
    let newY = currentPiece.y;
    while (canPlacePiece(board, currentPiece, currentPiece.x, newY + 1)) {
      newY++;
    }
    
    // Lock immédiatement à cette position
    const droppedPiece = { ...currentPiece, y: newY };
    const newBoard = mergePieceToBoard(board, droppedPiece);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    
    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * 100 + (newY - currentPiece.y) * 2); // Bonus pour hard drop
    
    // Nouvelle pièce
    const nextPiece = randomPiece();
    if (!canPlacePiece(clearedBoard, nextPiece, nextPiece.x, nextPiece.y)) {
      setGameOver(true);
    } else {
      setCurrentPiece(nextPiece);
    }
  }, [board, currentPiece, gameOver]);

  // Display board avec la pièce actuelle
  const displayBoard = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    
    if (currentPiece && !gameOver) {
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell) {
            const boardY = currentPiece.y + dy;
            const boardX = currentPiece.x + dx;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = currentPiece.color;
            }
          }
        });
      });
    }
    
    return newBoard;
  }, [board, currentPiece, gameOver]);

  // AI auto-play logic
  useEffect(() => {
    if (!isAI || gameOver) return;
    
    const makeAIMove = () => {
      const bestMove = findBestMove(board, currentPiece);
      
      if (!bestMove) {
        setGameOver(true);
        return;
      }
      
      // Execute the best move
      const pieceData = PIECES[currentPiece.type];
      const targetRotation = bestMove.rotation;
      const targetX = bestMove.x;
      
      // Set piece to target rotation and position
      setCurrentPiece(prev => ({
        ...prev,
        shape: pieceData.shape[targetRotation],
        rotation: targetRotation,
        x: targetX
      }));
      
      // Drop it immediately
      setTimeout(() => {
        hardDrop();
      }, 100); // Small delay so you can see the AI "thinking"
    };
    
    // AI makes decision when new piece spawns
    const aiTimeout = setTimeout(makeAIMove, 200);
    
    return () => clearTimeout(aiTimeout);
  }, [isAI, currentPiece.type, board, gameOver, hardDrop]);

  return {
    board: displayBoard(),
    score,
    gameOver,
    moveLeft,
    moveRight,
    rotate,
    drop,     
    hardDrop
  };
};