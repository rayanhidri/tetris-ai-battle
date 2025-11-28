//
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
  
  // count empty cells that have blocks above them
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
  
  // chek how uneven the surface is
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
      const diff = Math.abs(heights[i] - heights[i + 1]);
      
      // reduce penalty for edge columns (0-1 and 8-9)
      if (i === 0 || i === 8) {
        bumpiness += diff * 0.5;  // half penalty for edges
      } else {
        bumpiness += diff;  // full penalty for middle columns
      }
    }
    
    return bumpiness;
  };

  // get the height of the tallest column
export const getMaxColumnHeight = (board) => {
    let maxHeight = 0;
    
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 20; y++) {
        if (board[y][x] !== null) {
          const height = 20 - y;
          if (height > maxHeight) {
            maxHeight = height;
          }
          break;
        }
      }
    }
    
    return maxHeight;
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
  
  // Weighted score - lower is better
// TODO: might need to tune these more
export const evaluateBoard = (board) => {
    const height = getAggregateHeight(board);
    const holes = countHoles(board);
    const bumpiness = getBumpiness(board);
    const completeLines = countCompleteLines(board);
    const maxHeight = getMaxColumnHeight(board);
    
    // adaptative weights based on danger level
    let heightWeight, holesWeight, bumpinessWeight, linesWeight;
    
    if (maxHeight < 8) {
      // early game : aggressive
      heightWeight = 0.22;
      holesWeight = 1.25;
      bumpinessWeight = 0.35;
      linesWeight = -2.8;
    } else if (maxHeight < 14) {
      // mid game - balanced
      heightWeight = 0.28;
      holesWeight = 1.25;
      bumpinessWeight = 0.55;
      linesWeight = -2.2;
    } else {
      // survival mode
      heightWeight = 0.38;
      holesWeight = 1.5;
      bumpinessWeight = 0.6;
      linesWeight = -3.2;
    }
    
    return (
      height * heightWeight +
      holes * holesWeight +
      bumpiness * bumpinessWeight +
      completeLines * linesWeight
    );
  };