"""
CRATE ML Service — Synthetic Training Data Generator.

Generates ~2,000 realistic contributor records for training the
retention prediction model. The distributions are modeled on patterns
observed in real open-source repositories (response times, review cycles, etc.)

Run:  python data/generate_sample_data.py
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 2000  # number of synthetic contributors

def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def generate():
    # ── Feature Distributions ────────────────────────────────────────────────
    # first_response_hours: lognormal, median ~24h, tail up to 200h
    first_response_hours = np.random.lognormal(mean=3.2, sigma=1.1, size=N)
    first_response_hours = np.clip(first_response_hours, 0.5, 240)

    # review_cycles: 1-6, most contributors get 1-2 reviews
    review_cycles = np.random.choice(
        [1, 2, 3, 4, 5, 6],
        p=[0.35, 0.30, 0.18, 0.10, 0.05, 0.02],
        size=N
    )

    # changes_requested: 0-5, heavily skewed to 0-2
    changes_requested = np.random.choice(
        [0, 1, 2, 3, 4, 5],
        p=[0.30, 0.30, 0.22, 0.10, 0.05, 0.03],
        size=N
    )

    # merge_time_days: lognormal, median ~6 days
    merge_time_days = np.random.lognormal(mean=1.8, sigma=0.9, size=N)
    merge_time_days = np.clip(merge_time_days, 0.5, 60)

    # pr_comments: Poisson λ=5
    pr_comments = np.random.poisson(lam=5, size=N)
    pr_comments = np.clip(pr_comments, 0, 30)

    # ci_failures: most PRs have 0, some have 1-3
    ci_failures = np.random.choice(
        [0, 1, 2, 3],
        p=[0.60, 0.25, 0.10, 0.05],
        size=N
    )

    # is_good_first_issue: ~30% of first-timers find a good-first-issue
    is_good_first_issue = np.random.binomial(1, 0.30, size=N)

    # had_welcome_message: ~40% get a welcoming first response
    had_welcome_message = np.random.binomial(1, 0.40, size=N)

    # ── Target: returned ─────────────────────────────────────────────────────
    # Logistic model — coefficients encode known real-world patterns:
    #   fast response  → more likely to return
    #   fewer cycles   → more likely to return
    #   good-first-issue / welcome → more likely to return
    #   ci failures    → less likely to return

    # Normalize continuous features to [-1, 1] range for logit calc
    frh_norm = (first_response_hours - 24) / 48     # centered at 24h
    mtd_norm = (merge_time_days - 7) / 10           # centered at 7 days

    logit = (
        -0.6                                # base (gives ~35% retention without any signal)
        - 0.025 * first_response_hours      # each extra hour hurts
        - 0.40  * review_cycles             # more review cycles → higher churn
        - 0.30  * changes_requested         # more change requests → higher churn
        - 0.04  * merge_time_days           # slower merge → higher churn
        + 0.10  * pr_comments               # engagement is good (comment ↔ dialogue)
        - 0.35  * ci_failures               # CI failures discourage return
        + 1.00  * is_good_first_issue       # strong positive signal
        + 0.80  * had_welcome_message       # welcoming tone matters a lot
    )

    prob = sigmoid(logit)
    # Add small noise so the model has something to generalize from
    prob = np.clip(prob + np.random.normal(0, 0.05, size=N), 0.01, 0.99)
    returned = np.random.binomial(1, prob, size=N)

    # ── Assemble DataFrame ───────────────────────────────────────────────────
    df = pd.DataFrame({
        "first_response_hours": np.round(first_response_hours, 2),
        "review_cycles":        review_cycles,
        "changes_requested":    changes_requested,
        "merge_time_days":      np.round(merge_time_days, 2),
        "pr_comments":          pr_comments,
        "ci_failures":          ci_failures,
        "is_good_first_issue":  is_good_first_issue,
        "had_welcome_message":  had_welcome_message,
        "returned":             returned,
    })

    # Save
    out_path = os.path.join(os.path.dirname(__file__), "contributors_synthetic.csv")
    df.to_csv(out_path, index=False)

    print(f"[OK] Generated {N} contributor records -> {out_path}")
    print(f"     Overall retention rate : {returned.mean():.1%}")
    print(f"     Avg first response     : {first_response_hours.mean():.1f}h")
    print(f"     Avg review cycles      : {review_cycles.mean():.2f}")
    print(f"     Good-first-issue rate  : {is_good_first_issue.mean():.1%}")
    print(f"     Welcome message rate   : {had_welcome_message.mean():.1%}")
    return df


if __name__ == "__main__":
    generate()
