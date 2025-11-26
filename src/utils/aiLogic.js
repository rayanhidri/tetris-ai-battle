// AI evaluation functions for board state
// Lower score = better position

export const getAggregateHeight = (board) => {
    let totalHeight = 0;
    
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 20; y++) {
        if (board[y][x] !== null) {
          totalHeight += (20 - y);
          break;
        }
      }
    }
    
    return totalHeight;
  };
  
  // Count empty cells that have blocks above them
  export const countHoles = (board) => {
    let holes = 0;
    
    for (let x = 0; x < 10; x++) {
      let blockFound = false;
      for (let y = 0; y < 20; y++) {
        if (board[y][x] !== null) {
          blockFound = true;
        } else if (blockFound && board[y][x] === null) {
          holes++;
        }
      }
    }
    
    return holes;
  };
  
  // How uneven the surface is
  export const getBumpiness = (board) => {
    const heights = [];
    
    for (let x = 0; x < 10; x++) {
      let height = 0;
      for (let y = 0; y < 20; y++) {
        if (board[y][x] !== null) {
          height = 20 - y;
          break;
        }
      }
      heights.push(height);
    }
    
    let bumpiness = 0;
    for (let i = 0; i < heights.length - 1; i++) {
      bumpiness += Math.abs(heights[i] - heights[i + 1]);
    }
    
    return bumpiness;
  };
  
  export const countCompleteLines = (board) => {
    let completeLines = 0;
    
    for (let y = 0; y < 20; y++) {
      if (board[y].every(cell => cell !== null)) {
        completeLines++;
      }
    }
    
    return completeLines;
  };
  
  // Weighted score: these weights are from experimenting
  // TODO: might need to tune these more
  export const evaluateBoard = (board) => {
    const height = getAggregateHeight(board);
    const holes = countHoles(board);
    const bumpiness = getBumpiness(board);
    const completeLines = countCompleteLines(board);
    
    const heightWeight = 0.5;
    const holesWeight = 0.4
    const bumpinessWeight = 0.2
    const linesWeight = -0.8; // negative = we want more lines
    
    return (
      height * heightWeight +
      holes * holesWeight +
      bumpiness * bumpinessWeight +
      completeLines * linesWeight
    );
  };