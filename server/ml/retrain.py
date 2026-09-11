#!/usr/bin/env python3
"""Retrain the LifeFlow demand model on blood_data.

Pulls all rows from blood_data, trains gradient-boosting regressors
(units_donated / units_used) on lag + seasonal features pooled across
(state, blood_type) groups, evaluates MAPE against a held-out recent
window, saves the bundle, and inserts an INACTIVE row into
model_versions. Promotion happens in Node (cron job) after comparison.

Usage:  python3 ml/retrain.py [--holdout-months 3]
Output: single JSON line on stdout: {model_version_id, mae, mape, file_path}
"""
import argparse
import json
import math
import os
import pickle
import sys
from datetime import datetime, timezone
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

HERE = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.dirname(HERE)
MODELS_DIR = os.path.join(HERE, "models")
TARGETS = ["units_donated", "units_used"]


def load_database_url():
    """Read DATABASE_URL from server/.env (dotenv not required)."""
    env_path = os.path.join(SERVER_DIR, ".env")
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("DATABASE_URL not found in server/.env")


def pg_dsn(database_url):
    """Strip Prisma query params (?schema=...) for psycopg2."""
    parts = urlparse(database_url)
    clean = urlunparse((parts.scheme, parts.netloc, parts.path, "", "", ""))
    return clean


def fetch_data(dsn):
    import psycopg2

    conn = psycopg2.connect(dsn)
    try:
        df = pd.read_sql(
            "SELECT date, state, blood_type, units_donated, units_used "
            "FROM blood_data ORDER BY state, blood_type, date",
            conn,
            parse_dates=["date"],
        )
    finally:
        conn.close()
    df["month"] = df["date"].dt.to_period("M").dt.to_timestamp()
    return df


def build_features(group):
    """Lag + seasonal + trend features for one (state, blood_type) series."""
    g = group.sort_values("month").reset_index(drop=True)
    for target in TARGETS:
        for lag in (1, 2, 3):
            g[f"{target}_lag{lag}"] = g[target].shift(lag)
        g[f"{target}_roll3"] = g[target].shift(1).rolling(3).mean()
    g["t"] = range(len(g))
    m = g["month"].dt.month
    g["month_sin"] = [math.sin(2 * math.pi * x / 12) for x in m]
    g["month_cos"] = [math.cos(2 * math.pi * x / 12) for x in m]
    return g


def mape(y_true, y_pred):
    denom = [max(abs(v), 1.0) for v in y_true]
    return sum(abs(a - b) / d for a, b, d in zip(y_true, y_pred, denom)) / len(y_true)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--holdout-months", type=int, default=3)
    args = ap.parse_args()

    df = fetch_data(pg_dsn(load_database_url()))
    if df.empty:
        print(json.dumps({"error": "blood_data is empty, nothing to train on"}))
        return 1

    feats = pd.concat(
        [build_features(g) for _, g in df.groupby(["state", "blood_type"])],
        ignore_index=True,
    )
    feat_cols = (
        [f"{t}_lag{l}" for t in TARGETS for l in (1, 2, 3)]
        + [f"{t}_roll3" for t in TARGETS]
        + ["t", "month_sin", "month_cos"]
    )
    feats = feats.dropna(subset=feat_cols + TARGETS).reset_index(drop=True)
    if feats.empty:
        print(json.dumps({"error": "not enough history to build lag features (need 4+ months per group)"}))
        return 1

    cutoff = feats["month"].max() - pd.offsets.MonthBegin(args.holdout_months)
    train = feats[feats["month"] < cutoff]
    holdout = feats[feats["month"] >= cutoff]
    if train.empty or holdout.empty:
        print(json.dumps({"error": "holdout split left train or validation empty"}))
        return 1

    X_train = pd.get_dummies(train[feat_cols + ["state", "blood_type"]], columns=["state", "blood_type"])
    columns = list(X_train.columns)
    X_hold = pd.get_dummies(holdout[feat_cols + ["state", "blood_type"]], columns=["state", "blood_type"])
    X_hold = X_hold.reindex(columns=columns, fill_value=0)

    models, mapes, maes = {}, [], []
    for target in TARGETS:
        model = GradientBoostingRegressor(random_state=42)
        model.fit(X_train, train[target])
        pred = model.predict(X_hold)
        mapes.append(mape(holdout[target].tolist(), pred.tolist()))
        maes.append(float(abs(holdout[target].to_numpy() - pred).mean()))
        models[target] = model

    mape_avg = sum(mapes) / len(mapes)
    mae_avg = sum(maes) / len(maes)

    os.makedirs(MODELS_DIR, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    file_path = os.path.join(MODELS_DIR, f"gbm_{stamp}.pkl")
    with open(file_path, "wb") as f:
        pickle.dump({"models": models, "columns": columns, "feat_cols": feat_cols, "trained_at": stamp}, f)

    import psycopg2

    conn = psycopg2.connect(pg_dsn(load_database_url()))
    try:
        with conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO model_versions (trained_at, mae, mape, is_active, file_path) "
                "VALUES (NOW(), %s, %s, FALSE, %s) RETURNING id",
                (mae_avg, mape_avg, file_path),
            )
            version_id = cur.fetchone()[0]
    finally:
        conn.close()

    print(json.dumps({
        "model_version_id": version_id,
        "mae": round(mae_avg, 4),
        "mape": round(mape_avg, 4),
        "file_path": file_path,
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
