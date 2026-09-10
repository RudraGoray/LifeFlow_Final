# LifeFlow Backend

REST API for the LifeFlow blood bank demand/supply platform (SIH problem
statement 2). Built with Express + SQLite (`better-sqlite3` — no external DB
server needed). It mirrors the exact data shapes already used by the mock
data in the `lifeflow` React frontend, so wiring the frontend up is mostly
"replace the `useState([...])` mock arrays with a `fetch()` call."

## Setup

```bash
npm install
cp .env.example .env      # edit JWT_SECRET, CORS_ORIGIN etc.
npm run seed               # creates data/lifeflow.db and demo data
npm run dev                 # starts on http://localhost:4000
```

Demo accounts (password for all: `lifeflow123`):

| Role         | Email                  |
|--------------|-------------------------|
| Hospital     | hospital@lifeflow.in    |
| NGO          | ngo@lifeflow.in         |
| Blood Bank   | bloodbank@lifeflow.in   |

## Folder structure

```
src/
  server.js                  Express app + route mounting
  db.js                       SQLite connection + schema (auto-creates tables)
  seed.js                     Demo data matching the frontend's mock arrays
  middleware/auth.js          JWT verification + role guard
  routes/auth.routes.js       Register / login / me
  routes/bloodBanks.routes.js Directory + live stock per bank
  routes/demandTickets.routes.js   Hospital demand requests (raise/approve/reject/fulfill)
  routes/donationTickets.routes.js NGO donation camps (raise/approve/reject/receive)
  routes/stats.routes.js      Live network snapshot (Dashboard, LiveStatistics pages)
  routes/analytics.routes.js  Seasonal demand forecast + gap matrix
  utils/forecast.js           Seasonal projection helper (swap for a real model later)
```

## API reference

All authenticated routes expect `Authorization: Bearer <token>` from `/api/auth/login`.

### Auth
- `POST /api/auth/register` — `{ name, email, password, role, orgName }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` — current user

### Blood banks
- `GET /api/blood-banks` — directory; `?group=O-&minUnits=2` ranks by stock+distance (powers RaiseBloodDemand's auto-suggestion)
- `GET /api/blood-banks/:id`
- `PATCH /api/blood-banks/:id/stocks` (blood_bank role) — `{ group, units }`

### Demand tickets (RaiseBloodDemand / ViewConfirmTickets)
- `GET /api/demand-tickets?status=pending`
- `POST /api/demand-tickets` (hospital role) — `{ urgency, bloodGroup, units, component, hospital, department, doctor, patientId, bankId, notes }`
- `PATCH /api/demand-tickets/:id` (blood_bank role) — `{ action: 'approve'|'reject'|'fulfill', rejectReason? }`. `fulfill` deducts stock; fails with 409 if insufficient.

### Donation tickets (RaiseBloodDonated / ViewConfirmTickets)
- `GET /api/donation-tickets?status=pending`
- `POST /api/donation-tickets` (ngo role) — `{ bloodGroup, units, campName, ngo, venue, officer, coldTemp, sealNumber, bankId, notes }`
- `PATCH /api/donation-tickets/:id` (blood_bank role) — `{ action: 'approve'|'reject'|'receive', rejectReason? }`. `receive` credits stock.

### Stats (Dashboard / LiveStatistics)
- `GET /api/stats/live` — network totals, per-group stock %, pending/critical ticket counts
- `GET /api/stats/regional` — per-bank occupancy rollup

### Analytics (PredictedDemandAnalytics)
- `GET /api/analytics/predicted-demand?months=6` — seasonal forecast per blood group
- `GET /api/analytics/gap-matrix` — predicted shortfall vs current stock for next month

## Wiring it into the existing frontend

The frontend currently has zero `fetch`/`axios` calls — every page uses a
`const X = [...]` constant as mock data. To connect it:

1. Add an API client, e.g. `src/lib/api.js`:
   ```js
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
   export async function api(path, opts = {}) {
     const token = localStorage.getItem('lifeflow_token')
     const res = await fetch(`${API_URL}${path}`, {
       ...opts,
       headers: {
         'Content-Type': 'application/json',
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
         ...opts.headers,
       },
     })
     if (!res.ok) throw new Error((await res.json()).error || res.statusText)
     return res.json()
   }
   ```
2. In `AuthContext.jsx`, replace the fake `login()` with a call to
   `POST /api/auth/login`, store the returned token, and populate `user`/`role`
   from the response instead of the hardcoded `'Admin User'`.
3. In each page, replace the top-level `const X = [...]` with a `useEffect`
   that calls the matching endpoint above and stores the result in state —
   the field names were chosen to match the existing camelCase mock shapes,
   so most components need no other changes.

## Production notes

- Swap `JWT_SECRET` for a real random value before deploying.
- SQLite is fine for a hackathon demo; for real deployment move to Postgres
  (the query layer is isolated in the route files, so this is a contained change).
- Add rate limiting (`express-rate-limit`) on `/api/auth/login`.
