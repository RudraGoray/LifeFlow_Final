# LifeFlow — Full-Stack Blood Donation Platform

**Built by Team CRUDE-MAX**

LifeFlow is a full-stack web application that connects blood donors, NGOs, hospitals, and blood banks through real-time demand & supply matching, live inventory tracking, and predictive analytics.

## Tech Stack
- **Frontend:** React 19, Vite, TailwindCSS v4, React Router v7, Recharts, Framer Motion, Axios, Lucide icons
- **Backend:** Node.js, Express.js, Prisma ORM (PostgreSQL), JWT auth, Helmet, express-rate-limit
- **Database:** PostgreSQL
- **Auth:** JWT (7-day expiry) with Role-Based Access Control (HOSPITAL / NGO / BLOODBANK / ADMIN)

## Features

### Ticket workflows
- **Demand tickets (Hospital → Blood Bank):** hospitals raise blood requests with type, units, urgency, and required-by date; blood banks confirm or reject them (single + bulk).
- **Donation batches (NGO → Blood Bank):** NGOs submit collected units from camps; confirming a batch **automatically credits** the receiving bank's stock and writes a ledger entry.
- **Ticket states:** `PENDING → CONFIRMED / REJECTED / FULFILLED`, with urgency levels and department/patient references.

### Inventory tracking
- **Blood banks:** per-type vault stock (units + `CRITICAL/LOW/ADEQUATE` status), manual receipts/dispatches/write-offs, full movement ledger.
- **Hospitals:** ward fridge stock per type with transfusion-usage recording.
- **Analytics:** gained-vs-used charts (monthly + per blood type) from an append-only `StockMovement` ledger; NGO impact analytics (collections, donor growth, top camps) aggregated server-side.

### Platform
- **Role dashboards** with 30-second live refresh, operational feeds, and pending queues.
- **Donor/volunteer registry:** NGO donor registration with duplicate protection; regional volunteer pool with search + blood-type filters.
- **Camp directory & drive registration:** public upcoming-camp finder; camp lead form persisted as reviewable `AccountRequest` records.
- **Light + dark mode** with a persistent toggle (navbar + dashboard top bar).
- **Server-enforced security:** JWT session middleware on all protected endpoints, role scoping (including per-org/per-bank ownership checks), allow-list input validation, paginated list endpoints, login rate limiting, and hardened CORS/headers.

## App Map

### Public Pages (no auth required)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, live telemetry bar, verified throughput stats, command-center overview, upcoming drives, impact stories |
| `/find-camps` | Find a Donation Camp | Searchable camp directory with region filter; register interest per camp |
| `/camp-registration` | Register a Blood Drive | Lead form for NGOs/corporates to propose a camp (saved for admin review) |
| `/ngo-network` | NGO Partner Network | Live directory of partner NGOs with tiers and focus areas |
| `/impact-stories` | Stories of Impact | Testimonials & case studies |
| `/login` | Login Portal | Role-based login; redirects each role to its own dashboard |

### Shared (any authenticated user)

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | Role entry point | Redirects each account to its own dashboard |
| `/dashboard/hospital`, `/dashboard/ngo`, `/dashboard/bloodbank` | Role landing pages | Distinct per-role dashboards (see below) |
| `/settings` | Settings | Profile info, light/dark appearance switch, session info, sign out |

### Hospital Pages (`HOSPITAL` / `ADMIN`)

| Route | Page | Purpose |
|-------|------|---------|
| `/hospital/dashboard` | Hospital Operations | Active/critical tickets, fridge-stock snapshot, fulfillment rate, demand trend, recent tickets, operational feed |
| `/hospital/demand-tickets` | Demand Tickets | Paginated history of all raised blood requests with status |
| `/hospital/demand-tickets/new` | Raise Demand Ticket | Request blood units (type, units, urgency, department, required-by auto-filled from the clock) |
| `/hospital/blood-availability` | Blood Availability | Real-time per-type inventory across regional blood banks |
| `/hospital/inventory` | Fridge Inventory | Ward stock grid, record receipts/usage/corrections, movement ledger |
| `/hospital/analytics` | Blood Analytics | Received-vs-used charts (monthly + per type), net position |

### NGO Pages (`NGO` / `ADMIN`)

| Route | Page | Purpose |
|-------|------|---------|
| `/ngo/dashboard` | NGO Operations | Camps, units collected, registered donors, pending batches, recent batches, live upcoming camps |
| `/ngo/donation-batches` | Donation Batches | Paginated batch history with bank confirmations |
| `/ngo/donation-batches/new` | Submit Donation Batch | Register collected units for dispatch to a (live-loaded) blood bank |
| `/ngo/donors/new` | Register Donor | Enroll a donor into the regional registry (duplicate-protected) |
| `/ngo/volunteers` | Volunteer Pool | Searchable/filterable regional donor pool with stats and pagination |
| `/ngo/analytics` | Impact Analytics | Collections vs new donors, donor-growth curve, batch funnel, top camps |

### Blood Bank Pages (`BLOODBANK` / `ADMIN`)

| Route | Page | Purpose |
|-------|------|---------|
| `/bloodbank/dashboard` | Blood Bank Operations | Pending approvals, confirmed/rejected today, own-bank live stock grid, queue preview |
| `/bloodbank/tickets` | Ticket Management | Tabbed demand/donation queues with single + bulk confirm/reject (confirms auto-credit stock) |
| `/bloodbank/inventory` | Bank Inventory | Full vault stock table, record receipts/dispatches/write-offs, movement ledger |
| `/bloodbank/analytics` | Bank Analytics | Gained-vs-dispatched charts (monthly + per type), net position |

### Statistics — All Roles (any authenticated user)

| Route | Page | Purpose |
|-------|------|---------|
| `/statistics/overview` | Overview | Donated-vs-demanded dual bar chart with global filters |
| `/statistics/forecast` | AI Forecast | Actual-vs-predicted demand modeling chart |
| `/statistics/gap-analysis` | Gap Analysis | Blood-type deficit/surplus grid |
| `/statistics/regional` | Regional Breakdown | Drill-down table (State → City) with health badges |

> Widgets showing illustrative figures carry a **"Sample Data"** badge; everything else is live backend data.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Database Setup:**
   Ensure PostgreSQL is running and update `server/.env` with your `DATABASE_URL` (and optionally `CORS_ORIGIN`).
   ```bash
   cd server
   npx prisma db push
   node prisma/seed.js                 # banks, orgs, users, donors, inventory, tickets, camps, stats
   node prisma/backfill-inventory.js   # bank-user links, hospital stock, movement history
   node prisma/seed-volunteers.js      # extra regional volunteers
   ```

3. **Start Development Servers:**
   - **Backend:** `cd server && npm run dev` (or `node src/index.js`) → `http://localhost:5000`
   - **Frontend:** `cd client && npm run dev` → `http://localhost:5173` (proxies `/api` → `:5000`)

4. **Demo Accounts (password for all: `password123`):**
   - Hospital: `priya@stjude.hospital.org`
   - NGO: `vikram@redcross.ngo.org`
   - Blood Bank: `suresh@mhbloodbank.org`
   - Admin: `admin@lifeflow.org`

## API Overview

All protected routes require `Authorization: Bearer <JWT>`; 401 responses redirect to `/login`. List endpoints are paginated (`?page&limit` → `{rows, total, page, limit}`).

- `/api/auth` — Login (rate-limited), donor registration (duplicate-protected), camp/account-request leads (+ ADMIN review queue), donor directory (NGO region-scoped)
- `/api/dashboard/:role` — Role-scoped stats (role-matched; cross-role reads return 403)
- `/api/dashboard/ngo/impact` — Server-side NGO aggregates (monthly, growth, funnel, top camps)
- `/api/dashboard/feed/:orgId` — Org activity feed (own-org only)
- `/api/tickets/demand` — Hospital demand CRUD (validated, transacted, own-org scoped)
- `/api/tickets/donation` — NGO batch CRUD (validated, transacted, own-org scoped)
- `/api/tickets/pending|/:id/confirm|/:id/reject|/bulk` — Blood-bank queue (confirm auto-credits inventory)
- `/api/inventory/hospital|/bloodbank` — Stock views + adjustments (ownership-checked, ledger-written)
- `/api/inventory/movements` — Gained-vs-used time series for analytics
- `/api/bloodbanks` — Bank directory with inventory (HOSPITAL/NGO/ADMIN)
- `/api/camps` — Public upcoming camps; authenticated camp creation (NGO/HOSPITAL/ADMIN)
- `/api/organizations` — Public partner directory (NGO tiers included)
- `/api/stats/*` — Summary (public) + monthly/forecast/gap/regional (authenticated, validated filters)

---
*Developed by Team CRUDE-MAX for saving lives, one drop at a time.*
