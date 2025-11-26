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

  const moveLeft = useCallback(() => {
    if (gameOver) return;
    if (canPlacePiece(board, currentPiece, currentPiece.x - 1, currentPiece.y)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
    }
  }, [board, currentPiece, gameOver]);

  const moveRight = useCallback(() => {
    if (gameOver) return;
    if (canPlacePiece(board, currentPiece, currentPiece.x + 1, currentPiece.y)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
    }
  }, [board, currentPiece, gameOver]);

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

  const drop = useCallback(() => {
    if (gameOver) return;
    if (canPlacePiece(board, currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      // lock piece and check for lines
      const newBoard = mergePieceToBoard(board, currentPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);
      
      const nextPiece = randomPiece();
      if (!canPlacePiece(clearedBoard, nextPiece, nextPiece.x, nextPiece.y)) {
        setGameOver(true);
      } else {
        setCurrentPiece(nextPiece);
      }
    }
  }, [board, currentPiece, gameOver]);

  const hardDrop = useCallback(() => {
    if (gameOver) return;
    
    let newY = currentPiece.y;
    while (canPlacePiece(board, currentPiece, currentPiece.x, newY + 1)) {
      newY++;
    }
    
    const droppedPiece = { ...currentPiece, y: newY };
    const newBoard = mergePieceToBoard(board, droppedPiece);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    
    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * 100 + (newY - currentPiece.y) * 2);
    
    const nextPiece = randomPiece();
    if (!canPlacePiece(clearedBoard, nextPiece, nextPiece.x, nextPiece.y)) {
      setGameOver(true);
    } else {
      setCurrentPiece(nextPiece);
    }
  }, [board, currentPiece, gameOver]);

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

  // AI plays automatically
  useEffect(() => {
    if (!isAI || gameOver) return;
    
    const makeAIMove = () => {
      const bestMove = findBestMove(board, currentPiece);
      
      if (!bestMove) {
        setGameOver(true);
        return;
      }
      
      const pieceData = PIECES[currentPiece.type];
      const targetRotation = bestMove.rotation;
      const targetX = bestMove.x;
      
      // build the piece at target position
      const finalPiece = {
        type: currentPiece.type,
        shape: pieceData.shape[targetRotation],
        color: currentPiece.color,
        rotation: targetRotation,
        x: targetX,
        y: 0
      };
      
      // drop it to the bottom
      let finalY = 0;
      while (canPlacePiece(board, finalPiece, targetX, finalY + 1)) {
        finalY++;
      }
      
      finalPiece.y = finalY;
      
      // lock and update board
      const newBoard = mergePieceToBoard(board, finalPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);
      
      const nextPiece = randomPiece();
      if (!canPlacePiece(clearedBoard, nextPiece, nextPiece.x, nextPiece.y)) {
        setGameOver(true);
      } else {
        setCurrentPiece(nextPiece);
      }
    };
    
    const aiTimeout = setTimeout(makeAIMove, 300);
    
    return () => clearTimeout(aiTimeout);
  }, [isAI, currentPiece.type, board, gameOver]);

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