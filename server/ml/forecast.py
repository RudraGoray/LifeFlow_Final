#!/usr/bin/env python3
"""Generate the dashboard forecast from the ACTIVE model version.

Loads the active bundle from model_versions, predicts per (state,
blood_type) group for the past HISTORY_MONTHS (in-sample overlay) plus
the next MONTHS months (recursive), and rewrites the forecasts table.

Usage:  python3 ml/forecast.py [--months 12] [--history-months 12]
Output: single JSON line on stdout: {model_version_id, rows, months}
"""
import argparse
import json
import math
import os
import pickle
import sys
from datetime import date

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.dirname(HERE)
TARGETS = ["units_donated", "units_used"]


def month_start(d):
    return date(d.year, d.month, 1)


def add_months(d, n):
    m = d.month - 1 + n
    return date(d.year + m // 12, m % 12 + 1, 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--months", type=int, default=12)
    ap.add_argument("--history-months", type=int, default=12)
    args = ap.parse_args()

    import sys
    sys.path.insert(0, HERE)
    from retrain import load_database_url, pg_dsn  # noqa
    import psycopg2

    dsn = pg_dsn(load_database_url())
    conn = psycopg2.connect(dsn)
    try:
        meta = pd.read_sql(
            "SELECT id, file_path FROM model_versions WHERE is_active = TRUE "
            "ORDER BY trained_at DESC LIMIT 1",
            conn,
        )
        if meta.empty:
            print(json.dumps({"error": "no active model version"}))
            return 1
        version_id = int(meta.iloc[0]["id"])
        with open(meta.iloc[0]["file_path"], "rb") as f:
            bundle = pickle.load(f)
        hist = pd.read_sql(
            "SELECT date, state, blood_type, units_donated, units_used FROM blood_data",
            conn,
            parse_dates=["date"],
        )
    finally:
        conn.close()

    models, columns = bundle["models"], bundle["columns"]
    today = date.today()
    first_past = add_months(month_start(today), -(args.history_months - 1))

    rows = []
    for (state, btype), g in hist.groupby(["state", "blood_type"]):
        series = {
            t: dict(zip(
                pd.to_datetime(g["date"]).dt.to_period("M").dt.to_timestamp(),
                g[t],
            ))
            for t in TARGETS
        }

        def features_for(m):
            m_ts = pd.Timestamp(m)
            feat = {"t": len(series[TARGETS[0]])}
            feat["month_sin"] = math.sin(2 * math.pi * m.month / 12)
            feat["month_cos"] = math.cos(2 * math.pi * m.month / 12)
            for t in TARGETS:
                vals = [series[t].get(m_ts - pd.offsets.MonthBegin(i)) for i in (1, 2, 3)]
                for lag, v in zip((1, 2, 3), vals):
                    feat[f"{t}_lag{lag}"] = v
                feat[f"{t}_roll3"] = (
                    sum(v for v in vals if v is not None) / max(1, sum(1 for v in vals if v is not None))
                    if any(v is not None for v in vals) else None
                )
            feat["state"] = state
            feat["blood_type"] = btype
            return feat

        # past overlay (lags from actuals only; skip months lacking history)
        for i in range(args.history_months):
            m = add_months(first_past, i)
            if m >= month_start(today):
                break
            f = features_for(m)
            if any(f.get(c) is None for c in bundle["feat_cols"]):
                continue
            X = pd.get_dummies(pd.DataFrame([f]), columns=["state", "blood_type"]).reindex(columns=columns, fill_value=0)
            rows.append((m, state, btype,
                         max(0.0, round(float(models["units_donated"].predict(X)[0]), 2)),
                         max(0.0, round(float(models["units_used"].predict(X)[0]), 2))))

        # future (recursive: feed predictions back as lags)
        future = {t: dict(series[t]) for t in TARGETS}
        for i in range(args.months):
            m = add_months(month_start(today), i)
            m_ts = pd.Timestamp(m)
            f = {"t": len(future[TARGETS[0]]) + i,
                 "month_sin": math.sin(2 * math.pi * m.month / 12),
                 "month_cos": math.cos(2 * math.pi * m.month / 12),
                 "state": state, "blood_type": btype}
            ok = True
            for t in TARGETS:
                vals = [future[t].get(m_ts - pd.offsets.MonthBegin(j)) for j in (1, 2, 3)]
                if any(v is None for v in vals):
                    ok = False
                    break
                for lag, v in zip((1, 2, 3), vals):
                    f[f"{t}_lag{lag}"] = v
                f[f"{t}_roll3"] = sum(vals) / 3
            if not ok:
                continue
            X = pd.get_dummies(pd.DataFrame([f]), columns=["state", "blood_type"]).reindex(columns=columns, fill_value=0)
            preds = {t: max(0.0, round(float(models[t].predict(X)[0]), 2)) for t in TARGETS}
            for t in TARGETS:
                future[t][m_ts] = preds[t]
            rows.append((m, state, btype, preds["units_donated"], preds["units_used"]))

    conn = psycopg2.connect(dsn)
    try:
        with conn, conn.cursor() as cur:
            cur.execute("DELETE FROM forecasts")
            for m, state, btype, donated, used in rows:
                cur.execute(
                    "INSERT INTO forecasts (model_version_id, date, state, blood_type, "
                    "predicted_units_donated, predicted_units_used) "
                    "VALUES (%s, %s, %s, %s, %s, %s)",
                    (version_id, m, state, btype, donated, used),
                )
    finally:
        conn.close()

    print(json.dumps({"model_version_id": version_id, "rows": len(rows), "months": args.months}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
