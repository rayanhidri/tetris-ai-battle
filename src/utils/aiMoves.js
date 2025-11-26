import { PIECES } from '../constants/pieces';
import { canPlacePiece, mergePieceToBoard } from './gameLogic';
import { evaluateBoard } from './aiLogic';

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
    return null; // Invalid position
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
        moves.push({
          rotation,
          x,
          score: evaluateBoard(resultBoard),
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
  
  // Lower score = better
  allMoves.sort((a, b) => a.score - b.score);
  return allMoves[0];
};