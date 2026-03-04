# AI Agent Workflow Log

## Agents Used

| Agent | Primary Role |
|---|---|
| **Claude Opus 4.6** (claude.ai) | Architecture design, core domain logic, debugging, fact-checking, code review |
| **Gemini 2.5 Pro** (Google AI Studio) | Frontend component generation, boilerplate scaffolding, refactoring suggestions |
| **Official Documentation** | Prisma 7 migration guides, PostgreSQL SSL config, FuelEU Maritime regulation reference |

---

## Prompts & Outputs

### Example 1 — Hexagonal Architecture Scaffold (Claude Opus 4.6)

**Prompt:**
```
I am building a FuelEU Maritime compliance platform.
The stack is: Node.js + Express + Prisma 7 + PostgreSQL (backend), React + TypeScript + TailwindCSS (frontend).

Use strict Hexagonal Architecture (Ports & Adapters):
  - src/core/domain/      → Pure domain entities, no framework imports
  - src/core/application/ → Use-cases only (no Express, no Prisma)
  - src/core/ports/       → Interfaces (inbound + outbound)
  - src/adapters/inbound/http/   → Express route handlers
  - src/adapters/outbound/postgres/ → Prisma repository implementations
  - src/infrastructure/   → DB connection, server bootstrap

Generate the full folder structure with placeholder index.ts files and explain each layer's responsibility.
Do NOT import Express or Prisma anywhere inside src/core/.
```

**Output (snippet — Route domain entity):**
```typescript
// src/core/domain/Route.ts
export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;       // gCO₂e/MJ
  fuelConsumption: number;    // tonnes
  distance: number;           // km
  totalEmissions: number;     // tonnes
  isBaseline: boolean;
}
```

**Validation:** Confirmed that no framework imports leaked into `/core`. Manually verified folder structure matched the hexagonal pattern before proceeding to use-case implementation.

---

### Example 2 — Compliance Balance Use-Case (Claude Opus 4.6)

**Prompt:**
```
In our FuelEU Maritime app, implement the ComputeCB use-case inside src/core/application/.

Requirements:
  - Target Intensity (2025) = 89.3368 gCO₂e/MJ
  - Energy in scope (MJ) = fuelConsumption × 41,000
  - Compliance Balance (CB) = (Target − Actual GHG Intensity) × Energy in scope
  - Positive CB = Surplus; Negative CB = Deficit

The use-case must depend ONLY on the IRouteRepository port (interface), not on Prisma.
Return a typed result: { shipId, year, cb_gco2eq, energyMJ }.
Write the use-case class and its unit test using Vitest with a mock repository.
```

**Output (snippet — use-case):**
```typescript
// src/core/application/ComputeCBUseCase.ts
export class ComputeCBUseCase {
  private readonly TARGET_INTENSITY = 89.3368;
  private readonly ENERGY_FACTOR = 41_000;

  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(shipId: string, year: number): Promise<CBResult> {
    const routes = await this.routeRepo.findByShipAndYear(shipId, year);
    const energyMJ = routes.reduce((sum, r) => sum + r.fuelConsumption * this.ENERGY_FACTOR, 0);
    const avgGHG = routes.reduce((sum, r) => sum + r.ghgIntensity, 0) / routes.length;
    const cb_gco2eq = (this.TARGET_INTENSITY - avgGHG) * energyMJ;
    return { shipId, year, cb_gco2eq, energyMJ };
  }
}
```

**Validation:** Ran unit test with mock repository returning seed data (R001–R005). Verified CB formula output matched manual calculations. Adjusted `ENERGY_FACTOR` after cross-referencing the FuelEU Maritime regulation PDF.

---

### Example 3 — Prisma 7 Schema & Migration (Claude Opus 4.6 + Docs)

**Prompt:**
```
We are using Prisma 7 (NOT Prisma 5 or 6 — breaking changes apply).
Generate the complete schema.prisma for these tables:
  - routes (id, route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
  - ship_compliance (id, ship_id, year, cb_gco2eq)
  - bank_entries (id, ship_id, year, amount_gco2eq)
  - pools (id, year, created_at)
  - pool_members (pool_id, ship_id, cb_before, cb_after)

Also generate the seed file with the five KPI routes from the spec (R001–R005), setting R001 as the baseline.
Note: In Prisma 7, the `db push` and migration commands have changed. Use the correct Prisma 7 CLI syntax.
```

**Output:** Complete `schema.prisma` with correct Prisma 7 `datasource` block, all five models with proper relation fields, and a `seed.ts` file populating R001–R005. Agent initially used the deprecated `@default(autoincrement())` pattern from Prisma 5 — corrected by referencing Prisma 7 migration docs and switching to `@id @default(cuid())`.

**Correction applied:**
```diff
- id  Int    @id @default(autoincrement())
+ id  String @id @default(cuid())
```

---

### Example 4 — Banking & Pooling Logic (Claude Opus 4.6)

**Prompt:**
```
Implement two use-cases in src/core/application/:

1. BankSurplusUseCase:
   - Only allowed if CB > 0
   - Saves a bank_entry record via IBankRepository port
   - Returns { banked_amount, new_cb }

2. CreatePoolUseCase (Article 21 — Pooling):
   - Accept a list of { shipId, cb } members
   - Validate: Sum(CB) >= 0, deficit ship cannot exit worse, surplus ship cannot exit negative
   - Greedy allocation: sort members desc by CB, transfer surplus to deficits
   - Return cb_after per member

All business rules must live in the use-case, NOT in the Express handler.
Write edge-case tests: over-apply bank, invalid pool (sum < 0), zero CB.
```

**Output:** Full greedy allocation algorithm and validation guards. Confirmed business rule isolation — Express handlers only call `useCase.execute()` and map to HTTP responses.

---

### Example 5 — Frontend Dashboard Component (Gemini 2.5 Pro)

**Prompt:**
```
Create a React + TypeScript + TailwindCSS dashboard component: FuelEUDashboard.tsx
It must have four tabs: Routes | Compare | Banking | Pooling

Routes tab:
  - Fetch from GET /routes
  - Table columns: routeId, vesselType, fuelType, year, ghgIntensity, fuelConsumption, distance, totalEmissions
  - Filters: vesselType, fuelType, year (dropdown selects)
  - "Set Baseline" button per row → POST /routes/:id/baseline

Compare tab:
  - Fetch from GET /routes/comparison
  - Table: baseline route vs comparison routes, columns: ghgIntensity, % diff, compliant (✅/❌)
  - Bar chart using recharts comparing ghgIntensity values
  - Formula: percentDiff = ((comparison / baseline) - 1) * 100
  - Compliant if ghgIntensity <= 89.3368

Banking tab:
  - GET /compliance/cb?year=YYYY → show current CB
  - POST /banking/bank → bank surplus
  - POST /banking/apply → apply banked amount
  - KPIs: cb_before, applied, cb_after
  - Disable actions if CB ≤ 0

Pooling tab:
  - GET /compliance/adjusted-cb?year=YYYY → list ships with adjusted CB
  - POST /pools → create pool
  - Pool sum indicator: green if ≥ 0, red if < 0
  - Disable "Create Pool" if sum < 0

Use hexagonal frontend structure: components in adapters/ui/, API calls in adapters/infrastructure/apiClient.ts
```

**Output:** Full component with tab state, API hooks, recharts BarChart, and conditional UI logic. Corrected Tailwind classes for dark/light mode consistency and adjusted the compliance threshold check (initially used `< 89.3368` instead of `<= 89.3368`).

---

### Example 6 — Debugging Prisma 7 SSL on Render (Claude Opus 4.6)

**Prompt:**
```
Deployment on Render is failing with: "SSL connection required but not provided."
Our DATABASE_URL is set correctly as an environment variable.
We are using Prisma 7 with PostgreSQL on Render's managed database.
How do we configure SSL in Prisma 7? Show the exact datasource block and any Node.js pg config needed.
```

**Output:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```
Plus the `pg` SSL workaround:
```typescript
// infrastructure/db/prismaClient.ts
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL + "?sslmode=require" } },
});
```

**Validation:** Tested against Render logs after applying the fix. Connection succeeded. Claude correctly identified that Render's PostgreSQL requires `sslmode=require` and that Prisma 7 does not auto-append this unlike some older ORM wrappers.

---

## Validation / Corrections

| Issue | Root Cause | Fix Applied |
|---|---|---|
| Prisma 7 `autoincrement()` deprecation | AI trained on Prisma 5/6 patterns | Switched to `@default(cuid())` per Prisma 7 docs |
| SSL error on Render deployment | AI omitted SSL config for managed PG | Added `sslmode=require` to connection string |
| Compliance threshold off-by-one (`<` vs `<=`) | Gemini used strict less-than | Corrected to `<=` per FuelEU spec |
| Core layer imported Express `Request` type | Gemini scaffolded use-cases with Express typings | Removed Express dependency; used plain TS interfaces |
| `percentDiff` formula sign error | Initial output compared in wrong direction | Corrected formula: `((comparison / baseline) - 1) * 100` |

---

## Observations

### Where the Agents Saved Time
- **Boilerplate generation**: Both Claude and Gemini produced complete folder structures, interface files, and Prisma schemas in seconds — tasks that would have taken hours manually.
- **Debugging Render logs**: Claude acted as an expert interpreter for cryptic deployment errors, providing contextual fixes with precise configuration snippets.
- **Test scaffolding**: Unit tests for all five use-cases (ComputeComparison, ComputeCB, BankSurplus, ApplyBanked, CreatePool) were generated with correct Vitest mock patterns in one prompt.
- **Domain formula validation**: Claude double-checked the FuelEU regulation mathematics (CB formula, energy conversion factor) against the spec, catching a unit mismatch early.

### Where Agents Failed or Hallucinated
- **Prisma 7 breaking changes**: Both agents defaulted to Prisma 5/6 syntax. The training data cutoff meant Prisma 7's new migration and client patterns were unknown to the models.
- **Overly coupled scaffolding**: Gemini's first frontend output imported Axios directly into React components rather than through an infrastructure adapter — violating the hexagonal pattern. Required manual correction.
- **SSL configuration**: Neither agent proactively mentioned Render-specific SSL requirements; this required targeted debugging prompts.

### How Tools Were Combined Effectively
- Used **Claude Opus 4.6** for all architectural decisions and domain logic — its reasoning about separation of concerns was consistently reliable.
- Used **Gemini 2.5 Pro** for UI boilerplate and repetitive component generation — faster for visual/React work.
- Used **official documentation** as the tiebreaker whenever agent output conflicted with runtime behaviour (especially for Prisma 7 and PostgreSQL SSL).

---

## Best Practices Followed

- **Version pinning in first prompt**: After early Prisma 7 issues, all subsequent prompts began with `"We are using Prisma 7 and Node 22"` to prevent the model from defaulting to older patterns.
- **One concern per prompt**: Each prompt targeted a single use-case or layer. Combining banking + pooling + HTTP handlers in one prompt produced entangled code.
- **Explicit architectural constraints**: Every prompt included the rule `"Do NOT import Express or Prisma inside src/core/"` to keep the hexagonal boundary enforced.
- **Output validation before integration**: Generated code was reviewed and tested in isolation before being wired into the larger system.
- **Iterative refinement**: Prompts were refined 2–3 times per feature, progressively adding edge cases (negative CB, over-apply bank, invalid pool sum) rather than trying to get everything in one shot.
