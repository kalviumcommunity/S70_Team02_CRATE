"""
CRATE ML Service — Feature Engineering.

Transforms raw GitHub API JSON (PRs, reviews, comments, issues)
into the structured numeric feature vector that the ML model expects.

This module is used by TWO consumers:
  1. The Python ML API directly (for /predict/contributor endpoint)
  2. The Node.js featureService.js calls these same transformations
     and sends the result as JSON to this API.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any, Optional


# ── Constants ────────────────────────────────────────────────────────────────

WELCOME_KEYWORDS = [
    "welcome", "great", "thanks", "thank you", "awesome", "nice",
    "good job", "well done", "excellent", "congrats", "congratulations",
    "happy to have you", "glad", "fantastic", "first contribution",
]

GOOD_FIRST_ISSUE_LABELS = [
    "good first issue", "good-first-issue",
    "beginner", "beginner friendly", "starter",
    "easy", "first-timers-only", "help wanted",
    "up for grabs", "newcomer",
]


# ── Datetime Helper ──────────────────────────────────────────────────────────

def _parse_dt(iso_str: Optional[str]) -> Optional[datetime]:
    """Parse GitHub ISO 8601 timestamp to timezone-aware datetime."""
    if not iso_str:
        return None
    # GitHub returns "2026-01-05T10:00:00Z"
    return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))


def _hours_diff(start: Optional[datetime], end: Optional[datetime]) -> float:
    """Return hours between two datetimes. Returns 168 (7 days) if either is None."""
    if start is None or end is None:
        return 168.0
    delta = end - start
    return max(0.0, delta.total_seconds() / 3600)


def _days_diff(start: Optional[datetime], end: Optional[datetime]) -> float:
    """Return days between two datetimes. Returns 30 if either is None."""
    if start is None or end is None:
        return 30.0
    delta = end - start
    return max(0.0, delta.total_seconds() / 86400)


# ── Core Feature Extractor ───────────────────────────────────────────────────

def extract_pr_features(
    pr: Dict[str, Any],
    reviews: List[Dict[str, Any]],
    comments: List[Dict[str, Any]],
    all_prs_for_user: List[Dict[str, Any]],
    ci_failures: int = 0,
) -> Dict[str, Any]:
    """
    Given a contributor's FIRST pull request and associated data,
    produce the feature vector for the ML model.

    Args:
        pr               : PR object from GitHub API (GET /repos/:owner/:repo/pulls/:number)
        reviews          : Review objects (GET /repos/:owner/:repo/pulls/:number/reviews)
        comments         : Comment objects (GET /repos/:owner/:repo/issues/:number/comments)
        all_prs_for_user : All PRs the user ever opened in this repo (for 'returned' label)
        ci_failures      : Number of failed CI check runs on this PR's latest commit

    Returns:
        dict with keys matching ContributorFeatures schema + 'returned' label
    """
    pr_author     = pr["user"]["login"]
    pr_created    = _parse_dt(pr.get("created_at"))
    pr_merged     = _parse_dt(pr.get("merged_at"))

    # ── 1. first_response_hours ──────────────────────────────────────────────
    # Time from PR open to first response (review OR comment) by a non-author.
    first_response_dt: Optional[datetime] = None

    # Sort reviews by submission time, pick first by non-author
    sorted_reviews = sorted(reviews, key=lambda r: r.get("submitted_at", ""))
    for review in sorted_reviews:
        if review["user"]["login"] != pr_author and review.get("submitted_at"):
            first_response_dt = _parse_dt(review["submitted_at"])
            break

    # If no review, fall back to first comment by non-author
    if first_response_dt is None:
        sorted_comments = sorted(comments, key=lambda c: c.get("created_at", ""))
        for comment in sorted_comments:
            if comment["user"]["login"] != pr_author and comment.get("created_at"):
                first_response_dt = _parse_dt(comment["created_at"])
                break

    first_response_hours = _hours_diff(pr_created, first_response_dt)

    # ── 2. review_cycles ────────────────────────────────────────────────────
    # Total number of review submissions by maintainers (any state).
    review_cycles = sum(
        1 for r in reviews if r["user"]["login"] != pr_author
    )

    # ── 3. changes_requested ────────────────────────────────────────────────
    changes_requested = sum(
        1 for r in reviews if r.get("state") == "CHANGES_REQUESTED"
    )

    # ── 4. merge_time_days ──────────────────────────────────────────────────
    merge_time_days = _days_diff(pr_created, pr_merged)

    # ── 5. pr_comments ──────────────────────────────────────────────────────
    pr_comments_count = len(comments)

    # ── 6. is_good_first_issue ──────────────────────────────────────────────
    # Check PR labels AND the linked issue's labels
    pr_labels = [lb["name"].lower() for lb in pr.get("labels", [])]
    is_good_first_issue = int(
        any(label in pr_labels for label in GOOD_FIRST_ISSUE_LABELS)
    )

    # ── 7. had_welcome_message ──────────────────────────────────────────────
    # First maintainer comment — does it contain welcoming language?
    had_welcome_message = 0
    sorted_comments = sorted(comments, key=lambda c: c.get("created_at", ""))
    for comment in sorted_comments:
        if comment["user"]["login"] != pr_author:
            body = comment.get("body", "").lower()
            if any(kw in body for kw in WELCOME_KEYWORDS):
                had_welcome_message = 1
            break   # only check the FIRST maintainer comment

    # ── 8. returned (label) ─────────────────────────────────────────────────
    # Did the contributor open any PR AFTER this one?
    returned = 0
    for other_pr in all_prs_for_user:
        if other_pr["number"] == pr["number"]:
            continue
        other_created = _parse_dt(other_pr.get("created_at"))
        if other_created and pr_created and other_created > pr_created:
            returned = 1
            break

    return {
        "first_response_hours": round(first_response_hours, 2),
        "review_cycles":        int(review_cycles),
        "changes_requested":    int(changes_requested),
        "merge_time_days":      round(merge_time_days, 2),
        "pr_comments":          int(pr_comments_count),
        "ci_failures":          int(ci_failures),
        "is_good_first_issue":  int(is_good_first_issue),
        "had_welcome_message":  int(had_welcome_message),
        "returned":             int(returned),
    }


def extract_repo_stats(contributor_features: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregate a list of per-contributor feature dicts into repo-level stats.
    This is what the /score/onboarding and /recommendations endpoints consume.

    Args:
        contributor_features: List of dicts from extract_pr_features (returned key optional)

    Returns:
        RepoStats dict matching the RepoStats Pydantic schema
    """
    if not contributor_features:
        return {}

    import numpy as np
    arr = contributor_features

    def avg(key):
        vals = [c[key] for c in arr if key in c]
        return round(float(np.mean(vals)), 4) if vals else 0.0

    def rate(key):
        vals = [c[key] for c in arr if key in c]
        return round(float(np.mean(vals)), 4) if vals else 0.0

    returned_vals = [c["returned"] for c in arr if "returned" in c]
    retention_rate = round(float(sum(returned_vals) / len(returned_vals)), 4) if returned_vals else 0.0

    return {
        "avg_first_response_hours":      avg("first_response_hours"),
        "avg_review_cycles":             avg("review_cycles"),
        "avg_changes_requested":         avg("changes_requested"),
        "avg_merge_time_days":           avg("merge_time_days"),
        "avg_ci_failures":               avg("ci_failures"),
        "good_first_issue_rate":         rate("is_good_first_issue"),
        "welcome_message_rate":          rate("had_welcome_message"),
        "total_first_time_contributors": len(arr),
        "retention_rate":                retention_rate,
    }
