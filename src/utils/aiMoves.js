import { PIECES } from '../constants/pieces';
import { canPlacePiece, mergePieceToBoard } from './gameLogic';
import { evaluateBoard } from './aiLogic';

// Helper to get height of a specific column
const getColumnHeight = (board, col) => {
  for (let y = 0; y < 20; y++) {
    if (board[y][col] !== null) {
      return 20 - y;
    }
  }
  return 0;
};

// Helper to get average height across all columns
const getAverageHeight = (board) => {
  let totalHeight = 0;
  for (let x = 0; x < 10; x++) {
    totalHeight += getColumnHeight(board, x);
  }
  return totalHeight / 10;
};

// Drop piece at given rotation and x position, return resulting board
const simulateDrop = (board, piece, rotation, x) => {
  const pieceData = PIECES[piece.type];
  const shape = pieceData.shape[rotation];
  
  // Find where it lands
  let y = 0;
  while (canPlacePiece(board, { ...piece, shape }, x, y + 1)) {
    y++;
  }
  
  if (!canPlacePiece(board, { ...piece, shape }, x, y)) {
    return null;
  }
  
  const droppedPiece = { ...piece, shape, x, y };
  return mergePieceToBoard(board, droppedPiece);
};

// Try all possible placements for current piece
export const getAllPossibleMoves = (board, piece) => {
    const moves = [];
    const pieceData = PIECES[piece.type];
    const numRotations = pieceData.shape.length;
    
    for (let rotation = 0; rotation < numRotations; rotation++) {
      for (let x = 0; x < 10; x++) {
        const resultBoard = simulateDrop(board, piece, rotation, x);
        
        if (resultBoard) {
          let score = evaluateBoard(resultBoard);
          let bonusApplied = 0;
          
          // massive bonus for I piece vertical on edges
          if (piece.type === 'I' && rotation === 1) {
            const columnHeight = getColumnHeight(resultBoard, x);
            const avgHeight = getAverageHeight(resultBoard);
            
            if (x === 0 || x === 9) {
              if (columnHeight < avgHeight - 3) {
                bonusApplied = -15;
                score -= 15;
              } else if (columnHeight < avgHeight) {
                bonusApplied = -5;
                score -= 5;
              }
            }
            
            console.log(`I vertical x=${x}: baseScore=${(score - bonusApplied).toFixed(2)}, bonus=${bonusApplied}, finalScore=${score.toFixed(2)}`);
          }
          
          moves.push({
            rotation,
            x,
            score,
            board: resultBoard
          });
        }
      }
    }
    
    return moves;
  };

export const findBestMove = (board, piece) => {
  const allMoves = getAllPossibleMoves(board, piece);
  
  if (allMoves.length === 0) return null;
  
  allMoves.sort((a, b) => a.score - b.score);
  
  return allMoves[0];
};