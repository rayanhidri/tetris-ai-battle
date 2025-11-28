from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from stable_baselines3 import PPO
import numpy as np
from typing import List

app = FastAPI()

# cors for react frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load trained model (tomorrow when done)
# model = PPO.load("tetris_ppo_model")

class BoardState(BaseModel):
    board: List[List[int]]
    currentPiece: str

@app.get("/")
def read_root():
    return {"message": "tetris rl api ready"}

@app.post("/predict")
def predict_move(state: BoardState):
    # todo: implement prediction logic
    # for now return random action
    action = int(np.random.randint(0, 40))
    rotation = action // 10
    x = action % 10
    
    return {
        "action": action,
        "rotation": rotation,
        "x": x
    }

@app.get("/health")
def health():
    return {"status": "ok"}