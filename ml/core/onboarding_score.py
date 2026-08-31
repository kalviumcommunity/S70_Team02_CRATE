"""
CRATE ML Service — Onboarding Score Calculator.

Computes a 0-100 composite onboarding health score for a repository
across 5 weighted dimensions. This is deterministic (rule-based),
not a trained ML model — it gives maintainers an intuitive breakdown.

Dimension weights:
  Response Time       30%  ← most impactful on retention
  PR Experience       25%
  Issue Accessibility 20%
  Community           15%
  Documentation       10%
"""

from typing import List, Dict, Any


# ── Scoring Helpers ───────────────────────────────────────────────────────────

def _clamp(val: float, lo: float = 0.0, hi: float = 100.0) -> int:
    return int(max(lo, min(hi, round(val))))


def _score_response_time(avg_hours: float) -> int:
    """
    Maps average first-response time to a 0-100 score.
    Based on research showing <48h correlates with significantly higher retention.
    """
    if avg_hours <= 4:
        return 100
    elif avg_hours <= 12:
        return 90
    elif avg_hours <= 24:
        return 78
    elif avg_hours <= 48:
        return 62
    elif avg_hours <= 72:
        return 45
    elif avg_hours <= 120:
        return 28
    else:
        return 12


def _score_pr_experience(
    avg_review_cycles: float,
    avg_changes_requested: float,
    avg_merge_days: float,
) -> int:
    """
    PR experience score — lower cycles, fewer changes, faster merge = better.
    """
    # Review cycles sub-score (0-100)
    if avg_review_cycles <= 1:
        cycle_score = 100
    elif avg_review_cycles <= 2:
        cycle_score = 80
    elif avg_review_cycles <= 3:
        cycle_score = 60
    elif avg_review_cycles <= 4:
        cycle_score = 40
    else:
        cycle_score = 20

    # Changes requested sub-score (0-100)
    if avg_changes_requested <= 0.5:
        change_score = 100
    elif avg_changes_requested <= 1:
        change_score = 80
    elif avg_changes_requested <= 2:
        change_score = 60
    elif avg_changes_requested <= 3:
        change_score = 40
    else:
        change_score = 20

    # Merge time sub-score (0-100)
    if avg_merge_days <= 2:
        merge_score = 100
    elif avg_merge_days <= 5:
        merge_score = 85
    elif avg_merge_days <= 10:
        merge_score = 68
    elif avg_merge_days <= 14:
        merge_score = 52
    elif avg_merge_days <= 21:
        merge_score = 35
    else:
        merge_score = 18

    return _clamp((cycle_score + change_score + merge_score) / 3)


def _score_issue_accessibility(good_first_issue_rate: float) -> int:
    """
    Higher rate of contributors finding a good-first-issue = better score.
    A rate of 0.5+ (50%) is excellent.
    """
    return _clamp(good_first_issue_rate * 200)  # 50% → 100, 30% → 60


def _score_community(welcome_rate: float, avg_pr_comments: float) -> int:
    """
    Welcome messages are the primary signal. PR comment volume (dialogue) is secondary.
    """
    welcome_score = _clamp(welcome_rate * 150)    # 67%+ welcome → 100

    # Engagement: 3-8 comments is ideal; too few = ignored, too many = overwhelming
    if 3 <= avg_pr_comments <= 8:
        engage_score = 100
    elif avg_pr_comments < 1:
        engage_score = 30
    elif avg_pr_comments < 3:
        engage_score = 65
    else:
        engage_score = max(40, 100 - (avg_pr_comments - 8) * 5)

    return _clamp(welcome_score * 0.70 + engage_score * 0.30)


def _score_documentation(avg_ci_failures: float) -> int:
    """
    CI failures on a first PR are a strong proxy for poor setup documentation.
    A contributor shouldn't need to guess how to make CI pass.
    """
    if avg_ci_failures <= 0.1:
        return 100
    elif avg_ci_failures <= 0.3:
        return 85
    elif avg_ci_failures <= 0.6:
        return 65
    elif avg_ci_failures <= 1.0:
        return 45
    elif avg_ci_failures <= 1.5:
        return 28
    else:
        return 12


# ── Aggregate Calculator ──────────────────────────────────────────────────────

def calculate_onboarding_score(
    contributors: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Compute repo-level onboarding score from a list of contributor feature dicts.

    Args:
        contributors: list of dicts (each matching ContributorFeatures schema)

    Returns:
        dict matching OnboardingScoreResponse schema
    """
    if not contributors:
        return {
            "overall": 0,
            "dimensions": {
                "response_time": 0, "pr_experience": 0,
                "issue_accessibility": 0, "community": 0, "documentation": 0,
            },
            "weakest_area": "No data available",
        }

    n = len(contributors)

    def avg(key):
        return sum(c.get(key, 0) for c in contributors) / n

    # ── Per-dimension scores ─────────────────────────────────────────────────
    rt_score  = _score_response_time(avg("first_response_hours"))
    pr_score  = _score_pr_experience(
        avg("review_cycles"),
        avg("changes_requested"),
        avg("merge_time_days"),
    )
    iss_score = _score_issue_accessibility(avg("is_good_first_issue"))
    com_score = _score_community(avg("had_welcome_message"), avg("pr_comments"))
    doc_score = _score_documentation(avg("ci_failures"))

    dimensions = {
        "response_time":       rt_score,
        "pr_experience":       pr_score,
        "issue_accessibility": iss_score,
        "community":           com_score,
        "documentation":       doc_score,
    }

    # ── Weighted overall ─────────────────────────────────────────────────────
    weights = {
        "response_time":       0.30,
        "pr_experience":       0.25,
        "issue_accessibility": 0.20,
        "community":           0.15,
        "documentation":       0.10,
    }
    overall = _clamp(sum(dimensions[k] * weights[k] for k in dimensions))

    # ── Weakest area (for UI highlight) ─────────────────────────────────────
    label_map = {
        "response_time":       "Response Time",
        "pr_experience":       "PR Experience",
        "issue_accessibility": "Issue Accessibility",
        "community":           "Community",
        "documentation":       "Documentation",
    }
    weakest_key = min(dimensions, key=dimensions.get)
    weakest_area = f"{label_map[weakest_key]} ({dimensions[weakest_key]}/100)"

    return {
        "overall":     overall,
        "dimensions":  dimensions,
        "weakest_area": weakest_area,
    }
