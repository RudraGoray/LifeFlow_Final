# LifeFlow — Full-Stack Blood Donation Platform

**Built by Team CRUDE-MAX**

LifeFlow is a full-stack web application that connects blood donors, NGOs, hospitals, and blood banks through real-time demand & supply matching and predictive analytics.

## Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS v4, React Router v6, Recharts, Zustand/Context API
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** JWT with Role-Based Access Control

## App Map

### Public Pages (no auth required)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, live stat strip, upcoming drives, testimonials |
| `/find-camps` | Find a Donation Camp | Searchable camp directory with region/blood-type filters |
| `/camp-registration` | Register a Blood Drive | Lead form for NGOs/corporates to propose a camp |
| `/ngo-network` | NGO Partner Network | Directory of vetted partner NGOs |
| `/impact-stories` | Stories of Impact | Testimonials & case studies |
| `/login` | Login Portal | Role-based authentication (Hospital / NGO / Blood Bank) |

### Authenticated Pages (JWT required, role-scoped)

**Hospital**
| Route | Page | Purpose |
|-------|------|---------|
| `/hospital/dashboard` | Hospital Operations | Live demand/supply stats, trend chart, operational feed |
| `/hospital/demand-tickets` | Demand Tickets | Track all raised blood requests |
| `/hospital/demand-tickets/new` | Raise Demand Ticket | Request blood units from regional blood banks |
| `/hospital/blood-availability` | Blood Availability | Real-time inventory across blood banks |

**NGO**
| Route | Page | Purpose |
|-------|------|---------|
| `/ngo/dashboard` | NGO Operations | Live camp/batch stats, recent donation batches |
| `/ngo/donation-batches` | Donation Batches | Track batch dispatches to blood banks |
| `/ngo/donation-batches/new` | Submit Donation Batch | Register collected units for dispatch |

**Blood Bank**
| Route | Page | Purpose |
|-------|------|---------|
| `/bloodbank/dashboard` | Blood Bank Operations | Pending approvals, inventory health, ticket queue |
| `/bloodbank/tickets` | Ticket Management | Confirm/reject pending demand & donation tickets |

**All Roles — Statistics & Analytics**
| Route | Page | Purpose |
|-------|------|---------|
| `/statistics/overview` | Overview | Surplus/deficit dual bar chart with global filters |
| `/statistics/forecast` | AI Forecast | Predictive demand modeling chart |
| `/statistics/gap-analysis` | Gap Analysis | Blood-type deficit/surplus grid |
| `/statistics/regional` | Regional Breakdown | Drill-down table (State → City) |

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Database Setup:**
   Ensure PostgreSQL is running and update `server/.env` with your `DATABASE_URL`.
   ```bash
   cd server
   npx prisma db push
   node prisma/seed.js
   ```

3. **Start Development Servers:**
   - **Backend:** `cd server && npm run dev`
   - **Frontend:** `cd client && npm run dev`

## API Overview

The API is structured around role-based access using JWT. 
- `/api/auth` - Login and registration
- `/api/dashboard/:role` - Fetches role-scoped stats
- `/api/tickets/demand` - Hospital demand management
- `/api/tickets/donation` - NGO donation management
- `/api/tickets/pending` - Blood bank ticket confirmations
- `/api/stats/*` - Aggregated analytics data

---
*Developed by Team CRUDE-MAX for saving lives, one drop at a time.*
