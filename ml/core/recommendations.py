"""
CRATE ML Service — Recommendation Engine.

Pattern-based rule engine that maps aggregate repository statistics to
prioritized, actionable recommendations for maintainers.

Design principle: each rule checks ONE specific measurable threshold,
produces ONE clear recommendation, with a specific action to take.
We avoid vague advice like "improve documentation" — every recommendation
includes what to do, not just what is wrong.
"""

from typing import Dict, Any, List


# ── Rule Definitions ──────────────────────────────────────────────────────────
# Each rule is a dict:
#   condition     : callable(stats) -> bool
#   priority      : HIGH | MEDIUM | LOW
#   title         : short title (shown in dashboard card)
#   description   : why this matters (with metric context injected)
#   action        : concrete step the maintainer should take
#   metric_key    : which stat triggered it (shown as metric_context in response)

RULES = [
    # ── HIGH priority ────────────────────────────────────────────────────────
    {
        "id": "slow_first_response",
        "condition": lambda s: s["avg_first_response_hours"] > 48,
        "priority": "HIGH",
        "title": "Reduce first-response time",
        "description": (
            "Your average first response to new contributor PRs is {avg_first_response_hours:.0f} hours. "
            "Contributors receiving responses within 48 hours show significantly higher return rates in the analyzed data. "
            "A slow first response is often the single biggest driver of contributor churn."
        ),
        "action": (
            "Set up a GitHub Action that automatically greets first-time contributor PRs within minutes. "
            "Also, assign a team member to review first-timer PRs within 24 hours."
        ),
        "metric_key": "avg_first_response_hours",
    },
    {
        "id": "high_review_cycles",
        "condition": lambda s: s["avg_review_cycles"] > 2.5,
        "priority": "HIGH",
        "title": "Simplify PR review process",
        "description": (
            "New contributors average {avg_review_cycles:.1f} review round-trips before their PR is accepted. "
            "Each additional cycle increases the chance the contributor abandons the PR or doesn't return. "
            "This often signals unclear contribution guidelines or scope creep in issue definitions."
        ),
        "action": (
            "Clarify your CONTRIBUTING.md with exact code style rules and PR checklist. "
            "Scope issues more tightly so contributors know exactly what a 'done' PR looks like."
        ),
        "metric_key": "avg_review_cycles",
    },
    {
        "id": "very_low_retention",
        "condition": lambda s: s["retention_rate"] < 0.20,
        "priority": "HIGH",
        "title": "Critical: contributor retention is very low",
        "description": (
            "Only {retention_rate:.0%} of first-time contributors make a second contribution. "
            "This suggests systemic onboarding problems. "
            "Even small improvements in response time and welcome messaging can double retention."
        ),
        "action": (
            "Review your top 10 most recent first-timer PRs individually. "
            "Look for patterns in review tone, wait time, and issue clarity."
        ),
        "metric_key": "retention_rate",
    },

    # ── MEDIUM priority ───────────────────────────────────────────────────────
    {
        "id": "no_good_first_issues",
        "condition": lambda s: s["good_first_issue_rate"] < 0.25,
        "priority": "MEDIUM",
        "title": "Add more good-first-issue labels",
        "description": (
            "Only {good_first_issue_rate:.0%} of first-time contributors worked on an issue "
            "labeled as beginner-friendly. Contributors who start with a well-scoped easy issue "
            "show 2x higher 90-day retention in the analyzed data."
        ),
        "action": (
            "Audit your open issues and label at least 15–20 of them as 'good first issue'. "
            "Each should have a clear description, acceptance criteria, and estimated effort."
        ),
        "metric_key": "good_first_issue_rate",
    },
    {
        "id": "missing_welcome_messages",
        "condition": lambda s: s["welcome_message_rate"] < 0.40,
        "priority": "MEDIUM",
        "title": "Welcome new contributors more consistently",
        "description": (
            "Only {welcome_message_rate:.0%} of first-time contributors received a welcoming response. "
            "A simple 'Welcome! Great first PR!' message has a measurable positive effect on return rates. "
            "It signals that the community is friendly and appreciates the contribution."
        ),
        "action": (
            "Install a GitHub bot (e.g., welcome-bot or all-contributors) to automatically "
            "greet first-time contributors with a personalized welcome message."
        ),
        "metric_key": "welcome_message_rate",
    },
    {
        "id": "high_ci_failures",
        "condition": lambda s: s["avg_ci_failures"] > 0.5,
        "priority": "MEDIUM",
        "title": "Improve CI setup for new contributors",
        "description": (
            "First-time contributors average {avg_ci_failures:.1f} CI failures on their PRs. "
            "A failing CI on a first contribution is confusing and discouraging, especially if "
            "the failure is due to environment setup rather than the contributor's code."
        ),
        "action": (
            "Add a detailed 'Development Setup' section to your README. "
            "Add pre-commit hooks that run linting locally. "
            "Add a CI job that posts a friendly 'CI failed — here's how to fix it' comment for first-timers."
        ),
        "metric_key": "avg_ci_failures",
    },

    # ── LOW priority ──────────────────────────────────────────────────────────
    {
        "id": "slow_merge_time",
        "condition": lambda s: s["avg_merge_time_days"] > 14,
        "priority": "LOW",
        "title": "Speed up PR merge time",
        "description": (
            "PRs from first-time contributors take an average of {avg_merge_time_days:.0f} days to merge. "
            "While thoroughness is important, very long merge times can feel discouraging to newcomers "
            "who may lose momentum waiting for their contribution to land."
        ),
        "action": (
            "Designate a 'fast-track' label for well-scoped first-timer PRs. "
            "Aim to merge clean first-timer PRs within 7 days."
        ),
        "metric_key": "avg_merge_time_days",
    },
    {
        "id": "excessive_changes_requested",
        "condition": lambda s: s["avg_changes_requested"] > 2,
        "priority": "LOW",
        "title": "Reduce change request volume",
        "description": (
            "First-time contributors receive an average of {avg_changes_requested:.1f} change requests. "
            "Frequent back-and-forth on style, naming, or minor issues can be demoralizing. "
            "Reserve change requests for substantive issues."
        ),
        "action": (
            "Use an automated formatter (Prettier, Black, ESLint) to handle style automatically. "
            "Focus reviewer feedback on logic and architecture rather than style nitpicks."
        ),
        "metric_key": "avg_changes_requested",
    },
]


# ── Summary Generator ─────────────────────────────────────────────────────────

def _build_summary(stats: Dict[str, Any], triggered_count: int) -> str:
    ret = stats.get("retention_rate", 0)
    pct = int(ret * 100)

    if triggered_count == 0:
        return (
            f"Your repository shows strong onboarding health with a {pct}% contributor retention rate. "
            "Keep up the great work!"
        )
    elif stats.get("retention_rate", 0) < 0.20:
        return (
            f"Retention is critically low at {pct}%. "
            f"{triggered_count} friction pattern(s) were detected. "
            "Addressing high-priority items could meaningfully improve contributor return rates."
        )
    else:
        return (
            f"Your repository has a {pct}% contributor retention rate with "
            f"{triggered_count} area(s) identified for improvement. "
            "Addressing these patterns is associated with higher return rates in comparable repositories."
        )


# ── Public API ────────────────────────────────────────────────────────────────

def generate_recommendations(stats: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate prioritized recommendations for a repository.

    Args:
        stats: dict matching RepoStats schema

    Returns:
        dict matching RecommendationsResponse schema
    """
    triggered = []

    for rule in RULES:
        try:
            if rule["condition"](stats):
                # Inject actual metric values into description
                desc = rule["description"].format(**stats)
                metric_val = stats.get(rule["metric_key"])
                if isinstance(metric_val, float):
                    if "rate" in rule["metric_key"]:
                        metric_context = f"{metric_val:.0%}"
                    elif "hours" in rule["metric_key"]:
                        metric_context = f"{metric_val:.1f}h"
                    elif "days" in rule["metric_key"]:
                        metric_context = f"{metric_val:.1f} days"
                    else:
                        metric_context = f"{metric_val:.2f}"
                else:
                    metric_context = str(metric_val) if metric_val is not None else None

                triggered.append({
                    "priority":       rule["priority"],
                    "title":          rule["title"],
                    "description":    desc,
                    "action":         rule["action"],
                    "metric_context": metric_context,
                })
        except (KeyError, TypeError):
            continue  # Skip rules if stats key is missing

    # Sort: HIGH first, then MEDIUM, then LOW
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    triggered.sort(key=lambda r: priority_order.get(r["priority"], 99))

    return {
        "recommendations": triggered,
        "summary": _build_summary(stats, len(triggered)),
    }
