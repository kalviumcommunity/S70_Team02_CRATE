import pandas as pd
from datetime import datetime

def process_prs(prs: list) -> pd.DataFrame:
    """
    Extracts features like author and merge time in hours.
    Creates a heuristic 'returned' target label where merge_time < 72h means returned = 1.
    """
    if not prs:
        return pd.DataFrame()
    
    processed_data = []
    
    for pr in prs:
        # We only care about PRs that were actually merged, not just closed
        if not pr.get("merged_at"):
            continue
            
        author = pr["user"]["login"]
        
        # Parse ISO 8601 timestamps
        created_at_str = pr["created_at"].replace("Z", "+00:00")
        merged_at_str = pr["merged_at"].replace("Z", "+00:00")
        
        created_at = datetime.fromisoformat(created_at_str)
        merged_at = datetime.fromisoformat(merged_at_str)
        
        # Calculate merge time in hours
        merge_time_hours = (merged_at - created_at).total_seconds() / 3600.0
        
        # Heuristic: If merge time is less than 72 hours, assume the contributor is engaged/returned
        returned = 1 if merge_time_hours < 72 else 0
        
        processed_data.append({
            "author": author,
            "merge_time_hours": merge_time_hours,
            "returned": returned
        })
        
    df = pd.DataFrame(processed_data)
    return df
