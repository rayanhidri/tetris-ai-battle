from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from tetris_env import TetrisEnv
import os

def train_tetris_ai():
    print("creating tetris environment...")
    env = TetrisEnv()
    
    # check if environment follows gym api
    print("checking environment...")
    check_env(env, warn=True)
    print("environment is valid\n")
    
    # create ppo model
    print("creating ppo model...")
    model = PPO(
        "MlpPolicy",           # multi-layer perceptron policy
        env,
        verbose=1,             # print training progress
        learning_rate=0.0003,
        n_steps=2048,          # steps per update
        batch_size=64,
        n_epochs=10,
        gamma=0.99,            # discount factor
        tensorboard_log="./tensorboard_logs/"
    )
    
    print("\nstarting training...")
    print("this will take a while. go grab a coffee\n")
    
    # train for 100k steps (adjust based on results)
    # for serious training, use 1M+ steps overnight
    total_timesteps = 5000000  # was 100000
    
    model.learn(
        total_timesteps=total_timesteps,
        progress_bar=True
    )
    
    # save the model
    model_path = "tetris_ppo_model"
    model.save(model_path)
    print(f"\nmodel saved to {model_path}")
    
    # test the trained model
    print("\ntesting trained model...")
    obs, info = env.reset()
    total_reward = 0
    
    for i in range(100):
        action, _states = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(action)
        total_reward += reward
        
        if terminated:
            print(f"game over after {i+1} steps")
            print(f"total reward: {total_reward:.2f}")
            print(f"lines cleared: {env.lines_cleared_total}")
            break
    
    print("\ntraining complete")

if __name__ == "__main__":
    train_tetris_ai()