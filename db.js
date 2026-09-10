// db.js — SQLite connection + schema bootstrap for LifeFlow
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const DB_PATH = process.env.DB_PATH || './data/lifeflow.db'
const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('hospital','ngo','blood_bank')),
  org_name      TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blood_banks (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT,
  is_apex         INTEGER NOT NULL DEFAULT 0,
  distance_km     REAL,
  eta_minutes     INTEGER,
  address         TEXT,
  pincode         TEXT,
  contact         TEXT,
  license         TEXT,
  temperature     TEXT,
  capacity_total  INTEGER,
  features_json   TEXT NOT NULL DEFAULT '[]',
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blood_stocks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_id       TEXT NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  blood_group   TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units         INTEGER NOT NULL DEFAULT 0,
  capacity_units INTEGER NOT NULL DEFAULT 100,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(bank_id, blood_group)
);

CREATE TABLE IF NOT EXISTS demand_tickets (
  id            TEXT PRIMARY KEY,
  urgency       TEXT NOT NULL CHECK (urgency IN ('critical','warning','ok')),
  blood_group   TEXT NOT NULL,
  units         INTEGER NOT NULL,
  component     TEXT NOT NULL,
  hospital      TEXT NOT NULL,
  department    TEXT,
  doctor        TEXT,
  patient_id    TEXT,
  bank_id       TEXT REFERENCES blood_banks(id),
  sla_minutes   INTEGER,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','fulfilled')),
  reject_reason TEXT,
  notes         TEXT,
  created_by    TEXT REFERENCES users(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS donation_tickets (
  id            TEXT PRIMARY KEY,
  blood_group   TEXT NOT NULL,
  units         INTEGER NOT NULL,
  camp_name     TEXT NOT NULL,
  ngo           TEXT NOT NULL,
  venue         TEXT,
  officer       TEXT,
  cold_temp     TEXT,
  seal_number   TEXT,
  bank_id       TEXT REFERENCES blood_banks(id),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','received')),
  reject_reason TEXT,
  notes         TEXT,
  created_by    TEXT REFERENCES users(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stocks_bank ON blood_stocks(bank_id);
CREATE INDEX IF NOT EXISTS idx_demand_status ON demand_tickets(status);
CREATE INDEX IF NOT EXISTS idx_donation_status ON donation_tickets(status);
`)

module.exports = db
