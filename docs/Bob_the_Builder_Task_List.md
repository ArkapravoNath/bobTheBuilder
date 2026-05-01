# Bob the Builder — Claude Code Task List

> **How to use this file.** Each `###` heading is an atomic task intended to be scheduled in Claude Code (`/task <name>` or pasted as a scheduled-task prompt). Every task has **Context**, **Prereqs**, **Deliverables**, **Acceptance Criteria**, and **Out-of-Scope** so Claude Code can execute without back-and-forth. Work epics top-to-bottom; tasks inside an epic can be parallelised unless `Prereqs` says otherwise.

---

## Sprint 1 Status — Updated 2026-04-25

| Task | Status | Notes |
|------|--------|-------|
| TASK-0001 | ✅ DONE | Monorepo, pnpm workspaces, editorconfig, gitignore, README |
| TASK-0002 | ✅ DONE | `.github/workflows/ci.yml` — mobile, shared-schemas, mock-api, core-java, pricing-py jobs |
| TASK-0004 | ✅ DONE | `packages/shared-schemas` — Zod schemas for all domain types + TypeScript type exports |
| TASK-0501 | ✅ DONE | Asset intake folders: `assets/brand/`, `assets/figma/screens/`, `assets/figma/components/` |
| TASK-0502 | ✅ DONE | `scripts/assets-ingest.ts` — manifest generation, `pnpm assets:ingest` |
| TASK-0503 | ✅ DONE | `apps/mobile/assets/figma/tokens.json` seeded; `scripts/tokens-sync.ts`; `pnpm tokens:sync` |
| TASK-0504 | ✅ DONE | `docs/design/_task_template.md` + example `onboarding__archetype_picker.md` |
| TASK-0505 | ✅ DONE | `scripts/generate-brand-assets.ts` with Android density manifest; awaiting `logo.svg` drop |
| TASK-FE-0101 | ✅ DONE | Expo SDK 51 app (`apps/mobile`) — New Architecture, TypeScript strict, Expo Router v3 |
| TASK-FE-0102 | ✅ DONE | `src/theme/tamagui.config.ts` — all brand tokens wired; `generated-tokens.ts` from sync |
| TASK-FE-0201 | ✅ DONE | `services/mock-api` — Fastify + all stub endpoints + 12 Indian material fixtures in ₹ |
| TASK-FE-0301 | ✅ DONE | `AuthContext` + 5 screens: Landing, Sign-in, Sign-up, Forgot Password, Verify Email |
| TASK-FE-0302 | ✅ DONE | 3-step onboarding: Archetype picker (4 cards) → 20-city location → Budget/plot details |

**Sprint 1 exit status:** App boots → sign up with any email → complete onboarding → land on Designs list. ✅

---

- **Project codename:** Bob the Builder
- **Public product name:** **Build Buddy**
- **Brand:** Build Buddy — playful, approachable (cartoon-builder logo, bright primary colours)
- **Market (MVP):** India-only; currency ₹ (INR); regional multipliers seeded for top 20 Indian cities
- **Monorepo layout:** `apps/mobile` (React Native), `services/core-java` (Spring Boot), `services/pricing-py` (FastAPI), `packages/shared-schemas`, `infra/terraform`, `docs/`
- **Pricing model (MVP):** placeholder seed-scraped material rates; labour = 40% of materials; regional multiplier on top
- **MVP non-goals:** per-trade labour, full PDF/Word rate-card ingestion, 3D rendering, contractor RFQ, full admin console (instrumentation ships with MVP; the console UI is Epic 7, post-launch)

---

## Epic 0 — Foundations (Weeks 1–2)

### ✅ TASK-0001 · Bootstrap monorepo with pnpm workspaces
**Context.** We need a monorepo to hold the RN app, two backend services, shared schemas, and infra.
**Prereqs.** None.
**Deliverables.**
- Root `package.json` with pnpm workspaces (`apps/*`, `services/*`, `packages/*`).
- `pnpm-workspace.yaml`, `.nvmrc` (Node 20), `.editorconfig`, root `.gitignore`.
- `README.md` at repo root with architecture diagram link and run instructions.
**Acceptance Criteria.**
- `pnpm install` at root succeeds on a fresh clone.
- `pnpm -r run lint` runs across all workspaces (even if individual tasks are no-ops).
**Out-of-Scope.** Any service-specific code.

### ✅ TASK-0002 · CI baseline in GitHub Actions
**Context.** Every PR must be linted, type-checked, and unit-tested before merge.
**Prereqs.** TASK-0001.
**Deliverables.**
- `.github/workflows/ci.yml` with matrix jobs: `mobile`, `core-java`, `pricing-py`.
- Node 20 + JDK 21 + Python 3.12 installed per job; dependency caching.
- PR checks fail on lint error, type error, or failing test.
**Acceptance.** A dummy commit triggers all three jobs and they pass on an empty scaffold.

### TASK-0003 · Terraform skeleton for dev environment
**Context.** Infra-as-code from day 1.
**Prereqs.** TASK-0001.
**Deliverables.**
- `infra/terraform/envs/dev/` with root module wiring modules: `network`, `eks` (or `ecs-fargate`), `mongo-atlas`, `redis`, `s3`.
- `make tf-plan-dev` / `make tf-apply-dev` convenience targets.
- Remote state in S3 + DynamoDB lock.
**Acceptance.** `terraform plan` succeeds against placeholder variables; no secrets in VCS.

### ✅ TASK-0004 · Shared schemas package (`packages/shared-schemas`)
**Context.** The `Design` document and rate-card types are consumed by RN, Java, and Python. Single source of truth prevents drift.
**Prereqs.** TASK-0001.
**Deliverables.**
- Zod / JSON-Schema definitions for: `Design`, `Floor`, `Room`, `Fixture`, `Estimate`, `RateItem`, `RegionalMultiplier`.
- Codegen: emit TypeScript types for RN, POJOs for Java (via `jsonschema2pojo`), Pydantic v2 models for Python.
- `pnpm --filter @bob/shared-schemas build` produces all three outputs under `dist/`.
**Acceptance.** Changing one schema file regenerates client types; CI fails if generated output is stale.

---

## Epic 0.5 — Asset Intake & Design System (Weeks 2–3)

### ✅ TASK-0501 · Create UI asset intake folders
**Context.** The founder is delivering Figma exports and a logo. We need a canonical drop zone so UI-generation tasks can find them.
**Prereqs.** TASK-0001.
**Deliverables.**
- Folders: `apps/mobile/assets/brand/`, `apps/mobile/assets/figma/screens/`, `apps/mobile/assets/figma/components/`.
- `apps/mobile/assets/README.md` explaining naming conventions (`<flow>__<screen>.png`) and the pipeline.
- `.gitattributes` flagging PNG/SVG as binary LFS candidates.
**Acceptance.** Running `tree apps/mobile/assets` matches the layout in Section 6.4 of the design spec.

### ✅ TASK-0502 · Asset-ingest pipeline script
**Context.** When new Figma exports land, we need optimised 1x/2x/3x variants and an auto-generated manifest that UI-generation tasks can reference.
**Prereqs.** TASK-0501.
**Deliverables.**
- `scripts/assets-ingest.ts` that: optimises PNG/SVG, produces `@2x`/`@3x` where missing, writes `apps/mobile/assets/_manifest.json` (keys: screen name → paths, dimensions, hash).
- `pnpm run assets:ingest` wired up at root.
- Husky pre-commit hook that rejects un-ingested assets.
**Acceptance.** Dropping a screen `onboarding__archetype_picker.png` into `figma/screens/` and running `pnpm run assets:ingest` produces the manifest entry and size variants; committing without running it fails pre-commit.

### ✅ TASK-0503 · Design-tokens sync to Tamagui theme
**Context.** Figma tokens (colours, type, spacing, radii) should drive the app theme, not hand-coded constants.
**Prereqs.** TASK-0501.
**Deliverables.**
- `apps/mobile/assets/figma/tokens.json` (schema matches Figma Tokens plugin or Figma Variables REST export).
- `scripts/tokens-sync.ts` that regenerates `apps/mobile/theme.ts` (Tamagui `createTheme`).
- `pnpm run tokens:sync` target.
**Acceptance.** Editing `tokens.json` and running `tokens:sync` changes theme values; unit test asserts the generated theme object shape.

### ✅ TASK-0504 · UI-generation task template
**Context.** Every new screen implemented by Claude Code should reference a common template so prompts are consistent and thorough.
**Prereqs.** TASK-0501.
**Deliverables.**
- `docs/design/_task_template.md` covering: screen-export path, flow doc path, target route, data dependencies, a11y notes, acceptance criteria, test plan.
- Example instantiation: `docs/design/flows/onboarding__archetype_picker.md`.
**Acceptance.** Template is referenced by every subsequent `TASK-2xxx` UI task.

### ✅ TASK-0505 · Brand assets: logo, app icon, splash
**Context.** We have the founder's logo. We need the full platform-required set.
**Prereqs.** TASK-0501 and the logo file dropped at `apps/mobile/assets/brand/logo.svg`.
**Deliverables.**
- App icon sets for iOS (1024x1024 + all Xcode sizes) and Android (play store + all densities).
- Splash screen configured via `expo-splash-screen` or `react-native-bootsplash`.
- `scripts/generate-brand-assets.ts` that regenerates icon sets from `logo.svg`.
**Acceptance.** `pnpm run brand:generate` produces all sizes; an iOS archive uses the icon; the Android build uses the adaptive icon with correct foreground + background layers.

---

## Epic 1 — Auth & Onboarding (Weeks 3–5)

### TASK-1001 · Firebase Auth project + SDK integration in RN
**Prereqs.** TASK-0001, TASK-0501.
**Deliverables.** Firebase project (dev + prod), Google/Apple providers enabled, RN SDK wired in with `@react-native-firebase/auth`. Sign-in, sign-up, forgot-password screens from Figma.
**Acceptance.** Manual test: can sign up by email, sign in with Google and Apple; tokens persist across restarts; refresh token rotates after 30 days (simulated).

### TASK-1002 · Core service `/auth/session` and `/me`
**Prereqs.** TASK-0001, TASK-0002, TASK-0004.
**Deliverables.** Spring Boot module `auth-adapter` verifying Firebase JWTs, issuing an internal session token; `/me` returns profile + role; RBAC annotations (`@PreAuthorize`).
**Acceptance.** Postman collection passes; 401 on missing/expired tokens; 403 on admin route without admin role.

### TASK-1003 · Onboarding flow (archetype + location)
**Prereqs.** TASK-0502, TASK-1001.
**Deliverables.** RN onboarding screens (archetype picker, map-based location picker with postcode lookup, optional budget hint, optional plot dimensions). Saves via `PATCH /me/onboarding`.
**Acceptance.** E2E: new user → completes onboarding → lands on empty designs list. Re-login skips onboarding.

---

## Epic 2 — Design Canvas MVP (Weeks 5–10)

> **Note on Epic 2 sizing.** These points were bumped after the first review once we understood that the canvas is the product's core differentiator. Geometry, gestures, persistence, and undo/redo all interact and are easy to under-estimate.

### ✅ TASK-2001 · Skia canvas harness — **13 pts**
**Prereqs.** TASK-0503.
**Deliverables.** `apps/mobile/src/canvas/` with `react-native-skia` setup, pan + pinch-zoom, snap-to-grid (6-inch granularity), visible ruler overlay, viewport transform utilities, perf harness (drop-frame detection) wired into CI.
**Acceptance.** Pinch-zoom is smooth at 60 fps with 100 rectangles on mid-range Android (Pixel 6a baseline); perf harness produces a report artefact on every PR.

### ✅ TASK-2002 · Floor manager — **5 pts**
**Prereqs.** TASK-2001.
**Deliverables.** Add / remove / reorder floors; tabs at canvas edge; each floor independently editable; floor-height defaults per archetype.
**Acceptance.** Creating a 3-floor design, renaming and reordering floors, and switching between them preserves per-floor geometry and selection state.

### ✅ TASK-2003 · Room primitive — **13 pts** *(bumped from 8: warm palette + material selection added)*
**Prereqs.** TASK-2002.
**Deliverables.** Draw rectangular rooms via drag; resize handles on all four sides + corners; room-type picker (bedroom, bath, kitchen, living, dining, utility, garage, balcony, custom); per-room ceiling height; collision detection with adjacent rooms.
**Acceptance.** A room JSON entry conforms to the shared `Room` schema and round-trips through save+reload; overlapping a room shows a visual warning; delete-with-confirm works.

### ✅ TASK-2004 · Fixture tray (doors, windows, stairs) — **8 pts**
**Prereqs.** TASK-2003.
**Deliverables.** Drag-and-drop fixtures onto room edges; snap to wall segment with orientation lock; fixture spec sheet (size, style, glazing); stair primitive with direction and run length.
**Acceptance.** Dropping a window on a wall persists anchor to the wall segment; the anchor survives room resize and rotation; stairs connect two floors when placed near a floor boundary.
**Status.** ✅ Complete 2026-04-30. Implemented `wallSnap.ts` (snap threshold 18 units), `FixtureLayer.tsx` (Skia door/window/stair paths), `FixtureTray.tsx` (tray with 3 tools), `FixtureSpecSheet.tsx` (modal spec editor). 25 unit tests added; 64/64 passing.

### TASK-2005 · Finishes palette — **5 pts**
**Prereqs.** TASK-2003.
**Deliverables.** Long-press room → open finishes sheet (floor, walls, ceiling, door style, paint). Choices reference rate-item SKUs.
**Acceptance.** Changing flooring emits a `design.updated` event carrying the new finish SKU; canvas colour swatch reflects the choice.

### TASK-2006 · Design CRUD with auto-save — **8 pts**
**Prereqs.** TASK-0004, TASK-1002, TASK-2001.
**Deliverables.** Core service endpoints `POST /designs`, `GET /designs`, `PUT /designs/{id}`; 5-second throttled auto-save; optimistic client updates with last-write-wins + conflict detection; offline queue with retry.
**Acceptance.** Kill-the-app test: last 5 seconds of edits survive a cold restart; flight-mode edits sync on reconnect; concurrent edits from two devices produce a surfaced conflict banner.

### TASK-2007 · Undo/redo stack (50-step) — **8 pts**
**Prereqs.** TASK-2001.
**Deliverables.** Canvas-level undo/redo via operation-log abstraction; UI buttons in toolbar; two-finger gesture binding; redo is cleared on new op after undo.
**Acceptance.** Undoing 50 distinct operations (room add, move, resize, fixture add, finish change) restores the original state; memory footprint stays under 20 MB for the stack.

### TASK-2008 · Canvas performance hardening — **5 pts**
**Prereqs.** TASK-2001, TASK-2003, TASK-2004.
**Deliverables.** Off-screen room virtualisation, GPU-layer pinning for static elements, draw-call batching, perf budget tracked in CI.
**Acceptance.** 4-floor / 30-room design maintains 55+ fps during zoom on Pixel 6a and iPhone 13.

---

## Epic 3 — Pricing MVP & Scraper (Weeks 7–12, parallel with Epic 2)

### TASK-3001 · FastAPI service scaffold for Pricing
**Prereqs.** TASK-0001, TASK-0002, TASK-0004.
**Deliverables.** `services/pricing-py` with FastAPI, Uvicorn+Gunicorn, Motor (async MongoDB), health endpoint, Dockerfile, OpenTelemetry hooks.
**Acceptance.** `docker compose up pricing` exposes `/healthz` returning 200.

### TASK-3002 · Rate-item and rate-card-version collections
**Prereqs.** TASK-3001, TASK-0003.
**Deliverables.** Mongo collections + indices per Section 8.1 of the spec. Pydantic models in `pricing_py.models.rate_items`.
**Acceptance.** Seed script inserts 10 dummy rate items; admin GET returns them paginated.

### TASK-3003 · One-off seed scrape script — **3 pts**
**Prereqs.** TASK-3001.
**Context.** We don't need a full pluggable scraping platform. A single script that seeds the initial rate card is enough — ongoing updates happen through the manual-entry admin UI (TASK-3008) and, in Phase 6, through the PDF/Word ingestion pipeline.
**Deliverables.**
- `services/pricing-py/scripts/seed_rates.py`: standalone, CLI-invoked script.
- Pulls from 2–3 hardcoded public sources (passed via args or a simple `sources.yaml`).
- Uses `httpx` + `selectolax` only (no Playwright, no queueing, no cron).
- Writes a single `rate_card_version` in `draft` status with 50–100 seed rate items; annotates each with `source`, `scrapedAt`.
- README explains how to re-run after MVP when a rate refresh is needed.
**Acceptance.** Running `python -m pricing_py.scripts.seed_rates --out-version-id <id>` inserts seed items and produces a log of source URLs hit. No tests required beyond a dry-run flag.

### TASK-3008 · Admin rate-entry UI — **5 pts**
**Prereqs.** TASK-3006.
**Context.** The team will manage ongoing rate changes by hand. They need a usable screen — not just raw API calls.
**Deliverables.**
- Lives in the same admin console as Epic 7 (see TASK-7001). Until Epic 7 ships, exposed as a protected route in the mobile app for admins.
- Table view of rate items with search, filter by category, sort by SKU/rate.
- Inline edit for rate value, unit, and region; bulk CSV import; audit log of changes.
- Uses the `/admin/rate-cards/{id}/items` endpoints from TASK-3006.
**Acceptance.** Admin can search "cement" → edit the rate → the change shows in the audit log with admin user + timestamp; next estimate reflects the new rate after cache invalidation.

### TASK-3004 · Labour coefficient + regional multipliers
**Prereqs.** TASK-3002.
**Deliverables.**
- Config file at `services/pricing-py/config/pricing.yaml` with `labour_coefficient: 0.40`, hot-reloadable.
- `regional_multipliers` collection seeded with top 20 Indian cities + tier mapping.
- Admin endpoints: `GET /admin/regional-multipliers`, `PUT /admin/regional-multipliers/{region}`.
**Acceptance.** Changing the coefficient to 0.35 and restarting the service reflects in a recomputed estimate.

### TASK-3005 · `/estimates:calculate` endpoint
**Prereqs.** TASK-0004, TASK-3002, TASK-3004.
**Deliverables.**
- REST `POST /v1/estimates:calculate` accepting a Design document + location; returns the full breakdown.
- gRPC server exposing the same operation for east-west calls from Java.
- Deterministic: given (design, location, rateCardVersionId) returns the same result byte-for-byte.
**Acceptance.** Snapshot test with a canonical design produces the same JSON across 10 runs.

### TASK-3006 · Admin rate-card endpoints
**Prereqs.** TASK-3002, TASK-3003.
**Deliverables.** `POST /admin/rate-cards:scrape`, `GET /admin/rate-cards`, `POST /admin/rate-cards/{id}:publish`, item-level CRUD.
**Acceptance.** Admin flow: scrape → list draft → edit one item → publish → previous version is archived.

### TASK-3007 · Core ↔ Pricing integration
**Prereqs.** TASK-2006, TASK-3005.
**Deliverables.** Java `EstimateOrchestrator` that calls Pricing gRPC; stamps the returned `rateCardVersionId` onto the `estimates` collection entry.
**Acceptance.** `POST /designs/{id}/estimate` returns under 2 s P95 for a 4-floor / 30-room design; payload matches the shared `Estimate` schema.

---

## Epic 4 — Estimate UX & Exports (Weeks 10–13)

### TASK-4001 · Estimate screen
**Prereqs.** TASK-0502, TASK-3007.
**Deliverables.** RN screen showing materials subtotal, 40% labour line (labelled "Labour (MVP: 40% of materials)"), regional premium, overhead, grand total; drill-down by category.
**Acceptance.** Matches Figma export `estimate__summary.png` pixel-parity in DOM to within tolerance.

### TASK-4002 · PDF estimate export
**Prereqs.** TASK-4001.
**Deliverables.** Core service endpoint `POST /designs/{id}/export` rendering PDF with brand header, itemised breakdown, disclaimer "Indicative — MVP pricing". Email delivery via SES.
**Acceptance.** PDF opens in Acrobat and Preview without warnings; deliverable link is a signed URL with 7-day TTL.

### TASK-4003 · Share link
**Prereqs.** TASK-4002.
**Deliverables.** Generate a signed, time-bounded shareable link that renders the estimate without authentication.
**Acceptance.** Link works for 7 days; 404 after expiry; link is revokable from the design screen.

---

## Epic 5 — Hardening & Launch (Weeks 13–15)

### TASK-5001 · Load test core + pricing
**Deliverables.** k6 scripts reaching 200 rps on `/designs/{id}/estimate`; report on P50/P95/P99 + error rate.
**Acceptance.** P95 < 2 s at 200 rps; no 5xx under sustained load.

### TASK-5002 · Security review
**Deliverables.** OWASP MASVS checklist filled; pen test of auth + admin endpoints; Dependabot/Renovate wired.
**Acceptance.** Zero critical/high findings open.

### TASK-5003 · App Store + Play Store submissions
**Deliverables.** Signed builds, privacy manifest, data-safety form, screenshots from Figma, TestFlight + Play closed testing.
**Acceptance.** Both stores accept the build for review; closed-beta invitees can install.

### TASK-5004 · Observability & on-call
**Deliverables.** Datadog dashboards for both services, error budgets defined, PagerDuty schedule, runbooks in `docs/runbooks/`.
**Acceptance.** Triggering a synthetic 5xx pages on-call within 60 s.

---

## Epic 6 — Phase 2: Doc Ingestion & Per-Trade Labour (Weeks 16+)

### TASK-6001 · PDF/DOCX ingestion pipeline
**Prereqs.** Source document available from founder.
**Deliverables.** Pipeline per Section 9.2 of the design spec: `pdfplumber`/`python-docx`, `camelot-py`, OCR fallback, low-confidence review queue.
**Acceptance.** ≥ 95% of rows auto-mapped on the canonical annual document.

### TASK-6002 · Per-trade labour decomposition
**Prereqs.** Labour rate card populated.
**Deliverables.** Replace 40% multiplier with trade-level labour calculation (mason, plumber, electrician, painter, tiler, carpenter); expose per-trade breakdown in the estimate.
**Acceptance.** Snapshot estimate matches builder quote on 5 canonical designs within ±12%.

### TASK-6003 · Estimate calibration job
**Deliverables.** Offline job comparing our estimates against a user-supplied set of real builder quotes; suggests adjustments to regional multipliers and labour coefficient.
**Acceptance.** Running the job on a seed dataset produces a human-readable diff report.

---

## Epic 7 — Admin Monitoring Site (deprioritized, post-launch)

> **Priority note.** The admin monitoring site is specced now so it can be built quickly when needed, but **creation is deprioritized until after MVP launch**. The instrumentation hooks (counters, event emission) should be added throughout Epics 1–5 so that when we build the console it already has data. The console itself is the last thing we ship.
>
> Stack: a small Next.js web app in `apps/admin-web`, deployed behind the same API gateway, gated by `role=admin`.

### TASK-7001 · Admin console scaffold (Next.js) — **5 pts**
**Prereqs.** TASK-1001, TASK-1002.
**Deliverables.** `apps/admin-web` as a Next.js 14 app, NextAuth wired to Firebase Auth custom tokens, admin-only route guard, shell layout with nav (Dashboard, Users, Designs, Rate Cards, Support, Settings). Deployed to staging only until launch.
**Acceptance.** An admin user can log in; a non-admin is redirected out; empty pages render with the nav shell.

### TASK-7002 · Usage-limits dashboard — **5 pts**
**Prereqs.** TASK-7001, TASK-5004.
**Deliverables.**
- Rate limits per user/tier (free, paid) defined in `services/core-java/src/main/resources/limits.yaml`.
- Core service enforces limits: max designs per user, max estimates per day, max PDF exports per month.
- Admin dashboard shows: current rate-limit breaches (last 24 h), top-N users by usage, time-series of design/estimate volume.
**Acceptance.** Exceeding a limit produces a 429 with a clear error payload; the admin dashboard's "breaches in last 24 h" counter is correct.

### TASK-7003 · Customer support request inbox — **5 pts**
**Prereqs.** TASK-7001.
**Deliverables.**
- In the mobile app: "Need help?" entry in settings opens a form (category, message, optional design attachment).
- Backend: `POST /support/requests` endpoint; `support_requests` Mongo collection (_id, userId, category, message, designId, status, createdAt, responses[]).
- Admin inbox screen: list/filter by status, open a request, reply (stored in-thread), change status (open, pending user, resolved).
- Email notifications: user gets an email when the admin replies.
**Acceptance.** A user submits a support request from the mobile app; the admin sees it in the inbox within 10 s; the admin reply triggers an email to the user; status transitions are recorded in the audit log.

### TASK-7004 · Instrumentation hooks (to be added during Epics 1–5) — **3 pts**
**Prereqs.** None — done alongside each epic.
**Deliverables.**
- Event bus (in-process in core, gRPC for pricing) emits: `user.signup`, `design.created`, `design.updated`, `estimate.requested`, `pdf.exported`, `support.submitted`.
- Events persisted to a `events` collection with TTL = 90 days.
- Grafana/Datadog views wired to these events.
**Acceptance.** A live staging user action shows up in the events collection within 5 s, and the matching Grafana panel updates.

### TASK-7005 · Admin audit log — **3 pts**
**Prereqs.** TASK-7001, TASK-3008.
**Deliverables.** Every admin action (rate edit, request reply, user ban, etc.) writes to `admin_audit_log`. Admin screen to view/filter the log. Retention 7 years.
**Acceptance.** Editing a rate, replying to a support request, and changing a user role all produce audit entries visible to other admins.

---

## Epic 8 — AI Layout Generator (Weeks 11–15, parallel with Epic 4)

> **Why this exists.** The "Intelligent Layout Generator" Figma screen shows a feature where a user enters total sq ft + constraints (Vastu compliance, maximise natural light, layout typology) and the app generates candidate floor plans. This is a meaningful differentiator but a real scope expansion — pulled in as a new epic so estimates and risks stay honest.
>
> **Approach.** MVP ships a **constraint-based generative approach** (not a deep-learning model): we codify a rule engine that produces candidate layouts from plot dimensions + room requirements, ranked by heuristics (natural light, Vastu direction priorities, adjacency rules). A learned ML model is a Phase 2+ consideration. This keeps the feature shippable and explainable.

### TASK-8001 · Layout-generation service scaffold — **5 pts**
**Prereqs.** TASK-3001.
**Deliverables.** New module `services/pricing-py/layout/` (shares the Python service's runtime). REST endpoint `POST /v1/layouts:generate` accepting `{totalSqft, bedrooms, bathrooms, vastuCompliant, maxNaturalLight, typology}`; returns a list of candidate layout JSON documents.
**Acceptance.** Endpoint returns a stubbed list of 2 layouts in ≤ 300 ms; OpenAPI contract published.

### TASK-8002 · Constraint + rule engine — **13 pts**
**Prereqs.** TASK-8001, TASK-0004.
**Deliverables.**
- Rule set encoded in Python:
  - Vastu: kitchen in SE, master bedroom in SW, entrance in N/E, pooja room in NE, bathrooms in NW/W, heavy structures in S/W.
  - Natural light: living + primary bedroom on south/east walls; circulation on north.
  - Adjacency: kitchen adjacent to dining; master bed adjacent to primary bath; utility near kitchen.
  - Space ratios per room type (min + typical sqft).
- Constraint solver produces 3 candidate layouts ranked by score (weight-configurable).
- Output conforms to the shared `Design` schema so each layout is immediately editable in the canvas.
**Acceptance.** Given `{2500 sqft, 3 bed, 3.5 bath, vastu=true, typology=open-plan}`, solver returns 3 layouts with ≥ 90% rule compliance and all rooms fitting within the plot.

### TASK-8003 · Layout Generator UI — **8 pts**
**Prereqs.** TASK-0502, TASK-8002.
**Deliverables.** RN screen matching the `studio__layout_generator.png` export: parameters card (sqft slider, vastu toggle, max-light toggle, typology segmented control), "Generate Layouts" CTA, scrollable results with zoom + download per layout, "Regenerate" + "Save Layout" actions. Saving pushes the layout into the user's designs list and opens it in the canvas.
**Acceptance.** Generating → picking a layout → landing on the canvas with the rooms pre-placed takes < 8 s end to end.

### TASK-8004 · Layout ↔ Canvas handoff — **5 pts**
**Prereqs.** TASK-8003, TASK-2006.
**Deliverables.** Ensure generated layouts open losslessly in the canvas (rooms, walls, doors, windows pre-placed); user can edit freely from there.
**Acceptance.** A generated layout round-trips: generate → open in canvas → edit one room → re-save → re-open → edits preserved.

### TASK-8005 · Layout feedback loop — **3 pts**
**Prereqs.** TASK-8003, TASK-7004 (events).
**Deliverables.** Emit `layout.generated`, `layout.saved`, `layout.regenerated`, `layout.rejected` events. Capture which layouts users pick vs. regenerate. This data drives the Phase 2 ML approach.
**Acceptance.** Events appear in the events collection with layout parameters + chosen index attached.

---

## Appendix — Naming conventions for Claude Code

- Scheduled-task titles: `TASK-XXXX: <short imperative>` (e.g. `TASK-2001: Skia canvas harness`).
- Branch names: `task/XXXX-<kebab>`.
- Commit messages: Conventional Commits (`feat(canvas): skia harness (TASK-2001)`).
- PR body must link back to the task heading in this file.
