import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def fetch_closed_prs(owner: str, repo: str) -> list:
    """
    Fetches closed Pull Requests from the GitHub REST API.
    """
    token = os.getenv("GITHUB_TOKEN")
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
    }
    
    # Securely append token if it exists and is not the default placeholder
    if token and token != "your_github_personal_access_token_here":
        headers["Authorization"] = f"Bearer {token}"
    else:
        print("[Warning] No valid GITHUB_TOKEN found in .env. Proceeding with strict API rate limits.")

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    params = {
        "state": "closed",
        "per_page": 100, # Fetch up to 100 closed PRs
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"Other error occurred: {err}")
    
    return []
