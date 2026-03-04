# FuelEU Maritime Compliance Platform

A full-stack compliance management dashboard implementing **FuelEU Maritime Article 20 (Banking)** and **Article 21 (Pooling)**. Built with a strict Hexagonal Architecture to keep domain logic independent of all infrastructure concerns.

---

## Overview

This platform enables maritime operators to monitor and manage their GHG compliance obligations under the FuelEU Maritime regulation. It provides route-level emissions tracking, compliance balance calculation, surplus banking, and multi-vessel pooling — all backed by a structured REST API and an interactive React dashboard.

---

## Architecture

The project follows **Hexagonal Architecture (Ports & Adapters)**. The core domain has zero knowledge of Express, Prisma, or React. All framework interactions are isolated in adapters.

```
src/
  core/
    domain/           → Pure TypeScript entities (Route, ComplianceBalance, Pool)
    application/      → Use-cases (ComputeCB, BankSurplus, CreatePool, ...)
    ports/            → Interfaces: IRouteRepository, IBankRepository, IPoolRepository
  adapters/
    inbound/http/     → Express route handlers (call use-cases, map to HTTP)
    outbound/postgres/→ Prisma 7 repository implementations
    ui/               → React components and hooks
    infrastructure/   → API client (axios)
  infrastructure/
    db/               → Prisma client singleton
    server/           → Express app bootstrap
  shared/             → Shared types and error classes
```

**Dependency direction:** `core → ports → adapters`. Frameworks (Express, Prisma) only appear in `adapters/` and `infrastructure/`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript (strict), TailwindCSS, Recharts, Vitest |
| Backend | Node.js 22, Express, TypeScript (strict) |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Testing | Vitest (frontend unit), Supertest (backend integration) |

---

## Core Formulas

| Formula | Value |
|---|---|
| Target GHG Intensity (2025) | 89.3368 gCO₂e/MJ |
| Energy in Scope | `fuelConsumption (t) × 41,000 MJ/t` |
| Compliance Balance (CB) | `(Target − Actual GHG Intensity) × Energy in Scope` |
| Positive CB | Surplus (bankable) |
| Negative CB | Deficit (requires banking or pooling) |

---

## Database Schema

| Table | Key Columns | Purpose |
|---|---|---|
| `routes` | id, route_id, year, ghg_intensity, is_baseline | Route emissions data |
| `ship_compliance` | id, ship_id, year, cb_gco2eq | Computed CB snapshots |
| `bank_entries` | id, ship_id, year, amount_gco2eq | Banked surplus records |
| `pools` | id, year, created_at | Pool registry |
| `pool_members` | pool_id, ship_id, cb_before, cb_after | Per-ship pool allocations |

---

## API Endpoints

### Routes
- `GET /routes` — All routes with optional filters (`vesselType`, `fuelType`, `year`)
- `POST /routes/:id/baseline` — Set a route as the compliance baseline
- `GET /routes/comparison` — Baseline vs. all routes with `percentDiff` and `compliant` flags

### Compliance
- `GET /compliance/cb?shipId=&year=` — Compute and store a CB snapshot
- `GET /compliance/adjusted-cb?shipId=&year=` — CB after all bank applications

### Banking (Article 20)
- `GET /banking/records?shipId=&year=` — All bank entries for a ship
- `POST /banking/bank` — Bank a positive CB surplus
- `POST /banking/apply` — Apply banked surplus to a deficit (validates amount ≤ available)

### Pools (Article 21)
- `POST /pools` — Create a pool; validates Σ(CB) ≥ 0, runs greedy allocation, returns `cb_after` per member

---

## Setup & Run

### Prerequisites
- Node.js 22+
- PostgreSQL running locally (or a managed instance)
- `DATABASE_URL` set in `.env`

### Backend

```bash
cd backend
npm install
npx prisma migrate dev     # Creates tables
npm run seed               # Seeds R001–R005 with R001 as baseline
npm run dev                # Starts Express on :3001
```

**Render / managed PostgreSQL note:** Append `?sslmode=require` to your `DATABASE_URL` if deploying to a provider that enforces SSL.

### Frontend

```bash
cd frontend
npm install
npm run dev                # Starts Vite dev server on :5173
```

---

## Running Tests

### Frontend (Vitest)

```bash
cd frontend
npm run test
```

Tests cover: `ComputeComparison`, `ComputeCB`, `BankSurplus`, `ApplyBanked`, `CreatePool` use-cases, and all React components.

### Backend (Vitest + Supertest)

```bash
cd backend
npm run test
```

Tests cover: all use-case unit tests with mock repositories, HTTP integration tests via Supertest, and edge cases (negative CB, over-apply bank, invalid pool sum).

---

## Dashboard Tabs

| Tab | Description |
|---|---|
| **Routes** | Table of all routes with vesselType/fuelType/year filters and Set Baseline action |
| **Compare** | Baseline vs. comparison routes table + bar chart; compliance status per route |
| **Banking** | Current CB display, bank surplus, apply banked credit; KPIs: cb_before / applied / cb_after |
| **Pooling** | Multi-vessel CB view, pool sum indicator (green ≥ 0 / red < 0), Create Pool action |

---

## Seed Data

| routeId | vesselType | fuelType | year | ghgIntensity | fuelConsumption (t) | distance (km) | totalEmissions (t) |
|---|---|---|---|---|---|---|---|
| R001 *(baseline)* | Container | HFO | 2024 | 91.0 | 5000 | 12000 | 4500 |
| R002 | BulkCarrier | LNG | 2024 | 88.0 | 4800 | 11500 | 4200 |
| R003 | Tanker | MGO | 2024 | 93.5 | 5100 | 12500 | 4700 |
| R004 | RoRo | HFO | 2025 | 89.2 | 4900 | 11800 | 4300 |
| R005 | Container | LNG | 2025 | 90.5 | 4950 | 11900 | 4400 |

---

## Sample API Responses

**GET /routes/comparison**
```json
[
  {
    "routeId": "R002",
    "ghgIntensity": 88.0,
    "percentDiff": -3.30,
    "compliant": true
  },
  {
    "routeId": "R003",
    "ghgIntensity": 93.5,
    "percentDiff": 2.75,
    "compliant": false
  }
]
```

**GET /compliance/cb?shipId=SHIP-001&year=2024**
```json
{
  "shipId": "SHIP-001",
  "year": 2024,
  "cb_gco2eq": -71610000,
  "energyMJ": 205000000
}
```

**POST /pools**
```json
{
  "members": [
    { "shipId": "SHIP-001", "cb_after": 0 },
    { "shipId": "SHIP-002", "cb_after": 120000000 }
  ],
  "poolSumValid": true
}
```
