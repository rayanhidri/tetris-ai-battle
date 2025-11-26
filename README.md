# Tetris AI Battle

A Tetris game with an AI opponent. Player vs AI battle mode implemented in React.

## Features

- Player vs AI battle mode
- Heuristic-based AI (scores 25k-35k points)
- Smooth keyboard controls
- Real-time performance tracking

## Installation
```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Tech Stack

- React 18
- Custom hooks for game logic
- Heuristic AI with tuned weights

## AI Implementation

The AI evaluates board states using weighted heuristics.

Selects the move with the best evaluated outcome.

## Project Structure
```
src/
├── components/     # UI components
├── hooks/         # Game logic hooks
├── utils/         # AI and game mechanics
└── constants/     # Game configuration
```

## Roadmap

- Backend API with FastAPI
- Reinforcement learning AI
- Multiplayer support