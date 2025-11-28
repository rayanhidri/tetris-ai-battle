import gymnasium as gym
from gymnasium import spaces
import numpy as np
from typing import Tuple, List, Optional

# piece definitions - same as your frontend
PIECES = {
    'I': {
        'shapes': [
            [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
            [[1,0,0,0], [1,0,0,0], [1,0,0,0], [1,0,0,0]]
        ],
        'color': 1
    },
    'O': {
        'shapes': [
            [[1,1], [1,1]]
        ],
        'color': 2
    },
    'T': {
        'shapes': [
            [[0,1,0], [1,1,1], [0,0,0]],
            [[0,1,0], [0,1,1], [0,1,0]],
            [[0,0,0], [1,1,1], [0,1,0]],
            [[0,1,0], [1,1,0], [0,1,0]]
        ],
        'color': 3
    },
    'S': {
        'shapes': [
            [[0,1,1], [1,1,0], [0,0,0]],
            [[0,1,0], [0,1,1], [0,0,1]]
        ],
        'color': 4
    },
    'Z': {
        'shapes': [
            [[1,1,0], [0,1,1], [0,0,0]],
            [[0,0,1], [0,1,1], [0,1,0]]
        ],
        'color': 5
    },
    'J': {
        'shapes': [
            [[1,0,0], [1,1,1], [0,0,0]],
            [[0,1,1], [0,1,0], [0,1,0]],
            [[0,0,0], [1,1,1], [0,0,1]],
            [[0,1,0], [0,1,0], [1,1,0]]
        ],
        'color': 6
    },
    'L': {
        'shapes': [
            [[0,0,1], [1,1,1], [0,0,0]],
            [[0,1,0], [0,1,0], [0,1,1]],
            [[0,0,0], [1,1,1], [1,0,0]],
            [[1,1,0], [0,1,0], [0,1,0]]
        ],
        'color': 7
    }
}

PIECE_TYPES = list(PIECES.keys())

class TetrisEnv(gym.Env):
    """real tetris environment with full game logic"""
    
    def __init__(self):
        super(TetrisEnv, self).__init__()
        
        self.width = 10
        self.height = 20
        
        # action space: for simplicity, we'll use discrete actions
        # each piece has max 4 rotations × 10 positions = 40 actions
        self.action_space = spaces.Discrete(40)
        
        # observation: flattened board + metrics
        self.observation_space = spaces.Box(
            low=0, high=7, shape=(203,), dtype=np.float32
        )
        
        self.board = None
        self.current_piece_type = None
        self.score = 0
        self.lines_cleared_total = 0
        self.game_over = False
        
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        self.board = np.zeros((self.height, self.width), dtype=np.int8)
        self.score = 0
        self.lines_cleared_total = 0
        self.game_over = False
        
        self.current_piece_type = np.random.choice(PIECE_TYPES)
        
        return self._get_observation(), {}
    
    def step(self, action):
        # decode action
        rotation = action // 10
        x = action % 10
        
        # get piece data
        piece_data = PIECES[self.current_piece_type]
        num_rotations = len(piece_data['shapes'])
        
        # clamp rotation
        rotation = rotation % num_rotations
        shape = piece_data['shapes'][rotation]
        color = piece_data['color']
        
        # try to place piece
        y = self._find_drop_position(shape, x)
        
        if y is None or not self._can_place(shape, x, y):
            # invalid move, game over
            reward = -500
            terminated = True
            self.game_over = True
            return self._get_observation(), reward, terminated, False, {}
        
        # place piece
        self._place_piece(shape, x, y, color)
        
        # clear lines
        lines_cleared = self._clear_lines()
        self.lines_cleared_total += lines_cleared
        
        # calculate reward
        reward = self._calculate_reward(lines_cleared)
        
        # check if board too high
        if self._get_max_height() >= 18:
            terminated = True
            reward -= 200
        else:
            terminated = False
            # spawn next piece
            self.current_piece_type = np.random.choice(PIECE_TYPES)
        
        self.score += int(reward)
        
        return self._get_observation(), reward, terminated, False, {}
    
    def _can_place(self, shape, x, y):
        """check if piece can be placed at position"""
        for dy in range(len(shape)):
            for dx in range(len(shape[dy])):
                if shape[dy][dx]:
                    board_y = y + dy
                    board_x = x + dx
                    
                    # out of bounds
                    if board_x < 0 or board_x >= self.width or board_y >= self.height:
                        return False
                    
                    # collision
                    if board_y >= 0 and self.board[board_y, board_x] != 0:
                        return False
        return True
    
    def _find_drop_position(self, shape, x):
        """find where piece lands when dropped"""
        y = 0
        while self._can_place(shape, x, y + 1):
            y += 1
        
        if not self._can_place(shape, x, y):
            return None
        return y
    
    def _place_piece(self, shape, x, y, color):
        """place piece on board"""
        for dy in range(len(shape)):
            for dx in range(len(shape[dy])):
                if shape[dy][dx]:
                    board_y = y + dy
                    board_x = x + dx
                    if 0 <= board_y < self.height and 0 <= board_x < self.width:
                        self.board[board_y, board_x] = color
    
    def _clear_lines(self):
        """clear complete lines and return count"""
        lines_cleared = 0
        y = self.height - 1
        
        while y >= 0:
            if np.all(self.board[y, :] != 0):
                # line is complete
                lines_cleared += 1
                # shift everything down
                self.board[1:y+1, :] = self.board[0:y, :]
                self.board[0, :] = 0
            else:
                y -= 1
        
        return lines_cleared
    
    def _calculate_reward(self, lines_cleared):
        """calculate reward based on board state"""
        reward = 0
        
        # reward for clearing lines
        if lines_cleared == 1:
            reward += 100
        elif lines_cleared == 2:
            reward += 300
        elif lines_cleared == 3:
            reward += 500
        elif lines_cleared >= 4:
            reward += 800
        
        # penalties
        height_penalty = self._get_aggregate_height() * 0.5
        holes_penalty = self._count_holes() * 3
        bumpiness_penalty = self._get_bumpiness() * 0.5
        
        reward -= height_penalty
        reward -= holes_penalty
        reward -= bumpiness_penalty
        
        return reward
    
    def _get_observation(self):
        """convert board to observation vector"""
        # flatten board
        flat_board = self.board.flatten().astype(np.float32) / 7.0
        
        # metrics (normalized)
        metrics = np.array([
            self._get_aggregate_height() / 200.0,
            self._count_holes() / 50.0,
            self._get_bumpiness() / 100.0
        ], dtype=np.float32)
        
        return np.concatenate([flat_board, metrics])
    
    def _get_aggregate_height(self):
        """sum of all column heights"""
        heights = []
        for x in range(self.width):
            for y in range(self.height):
                if self.board[y, x] != 0:
                    heights.append(self.height - y)
                    break
            else:
                heights.append(0)
        return sum(heights)
    
    def _get_max_height(self):
        """height of tallest column"""
        for y in range(self.height):
            if np.any(self.board[y, :] != 0):
                return self.height - y
        return 0
    
    def _count_holes(self):
        """count holes"""
        holes = 0
        for x in range(self.width):
            found_block = False
            for y in range(self.height):
                if self.board[y, x] != 0:
                    found_block = True
                elif found_block and self.board[y, x] == 0:
                    holes += 1
        return holes
    
    def _get_bumpiness(self):
        """sum of height differences"""
        heights = []
        for x in range(self.width):
            for y in range(self.height):
                if self.board[y, x] != 0:
                    heights.append(self.height - y)
                    break
            else:
                heights.append(0)
        
        bumpiness = 0
        for i in range(len(heights) - 1):
            bumpiness += abs(heights[i] - heights[i+1])
        return bumpiness
    
    def render(self):
        """print board"""
        for row in self.board:
            print(''.join(['█' if cell else '·' for cell in row]))
        print(f"score: {self.score}, lines: {self.lines_cleared_total}")