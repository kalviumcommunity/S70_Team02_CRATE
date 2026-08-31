import os
from src.fetcher import fetch_closed_prs
from src.preprocess import process_prs
from src.model import RetentionPredictor

def main():
    print("=== CRATE ML Engine Initialization ===")
    
    # Example Target Repositories
    owner = "kalviumcommunity"
    repo = "S70_Team02_CRATE"
    
    # Step 1: Fetch Data
    print(f"\n[1] Fetching closed PRs for {owner}/{repo}...")
    prs = fetch_closed_prs(owner, repo)
    print(f"    -> Fetched {len(prs)} PRs.")
    
    # Fallback to a highly active public repository if the initial one is empty
    # This ensures the pipeline can be tested fully
    if not prs:
        print("\n    [!] No PRs found. Falling back to 'facebook/react' for demonstration purposes...")
        owner, repo = "facebook", "react"
        prs = fetch_closed_prs(owner, repo)
        print(f"    -> Fetched {len(prs)} PRs from {owner}/{repo}.")

    # Step 2: Preprocess Data
    print("\n[2] Processing GitHub PR data to extract features and labels...")
    df = process_prs(prs)
    
    if df.empty:
        print("    -> No merged PRs to process. Exiting.")
        return
        
    print(f"    -> Processed {len(df)} merged PRs.")
    print("\n    [Preview of processed Data]")
    print(df.head())
    
    # Step 3: Train Model
    print("\n[3] Initializing and training RandomForest model...")
    predictor = RetentionPredictor()
    predictor.train(df)
    
    # Step 4: Test Prediction
    if predictor.is_trained:
        print("\n[4] Running test predictions...")
        
        # Test Case 1: Fast Merge (Highly likely to return based on heuristic)
        test_merge_time_fast = 12.0 # 12 hours
        prob_fast = predictor.predict(test_merge_time_fast)
        
        # Test Case 2: Slow Merge (Unlikely to return based on heuristic)
        test_merge_time_slow = 120.0 # 120 hours
        prob_slow = predictor.predict(test_merge_time_slow)
        
        print("-" * 40)
        print(f"Test Case A (Merge Time: {test_merge_time_fast} hours):")
        print(f"Predicted Return Probability: {prob_fast:.1%}")
        print("-" * 40)
        print(f"Test Case B (Merge Time: {test_merge_time_slow} hours):")
        print(f"Predicted Return Probability: {prob_slow:.1%}")
        print("-" * 40)

if __name__ == "__main__":
    main()
