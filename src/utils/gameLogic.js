// Vérifie si une pièce peut être placée à une position donnée
export const canPlacePiece = (board, piece, x, y) => {
    for (let dy = 0; dy < piece.shape.length; dy++) {
      for (let dx = 0; dx < piece.shape[dy].length; dx++) {
        if (piece.shape[dy][dx]) {
          const boardY = y + dy;
          const boardX = x + dx;
          
          // Hors limites
          if (boardX < 0 || boardX >= 10 || boardY >= 20) {
            return false;
          }
          
          // Collision avec une pièce déjà placée
          if (boardY >= 0 && board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    return true;
  };
  
  // Fusionne la pièce avec le board (quand elle est lockée)
  export const mergePieceToBoard = (board, piece) => {
    const newBoard = board.map(row => [...row]);
    
    piece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const boardY = piece.y + dy;
          const boardX = piece.x + dx;
          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      });
    });
    
    return newBoard;
  };
  
  // Détecte et efface les lignes complètes
  export const clearLines = (board) => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });
    
    // Ajoute des lignes vides en haut
    while (newBoard.length < 20) {
      newBoard.unshift(Array(10).fill(null));
    }
    
    return { newBoard, linesCleared };
  };