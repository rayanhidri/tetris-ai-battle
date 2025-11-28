from tetris_env import TetrisEnv

# create environment
env = TetrisEnv()

# test reset
obs, info = env.reset()
print(f"Observation shape: {obs.shape}")
print(f"Initial observation: {obs[:10]}...")  # only first 10 vals

# test a few random steps
for i in range(5):
    action = env.action_space.sample()  # random action
    obs, reward, terminated, truncated, info = env.step(action)
    
    print(f"\nStep {i+1}:")
    print(f"  Action: {action}")
    print(f"  Reward: {reward:.2f}")
    print(f"  Terminated: {terminated}")
    print(f"  Max height: {env._get_max_height()}")
    
    if terminated:
        print("Game Over!")
        break

print("\nEnvironment test passed!")