# Build Buddy — Sprint Tracker

> Last updated: 2026-04-30
> Phase: Frontend-First (Sprint 3 of 4)

---

## Sprint 1 — Tappable Shell + Auth + Onboarding (Weeks 1–2)

**Goal:** On an Android emulator you can sign up with any email, complete onboarding, and land on a Designs list screen.

**Status:** ✅ COMPLETE

| Task ID | Title | Status | Deliverable |
|---------|-------|--------|-------------|
| TASK-0001 | Bootstrap monorepo with pnpm workspaces | ✅ Done | `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `README.md` |
| TASK-0002 | CI baseline — GitHub Actions | ✅ Done | `.github/workflows/ci.yml` — 5-job matrix (mobile, shared-schemas, mock-api, core-java, pricing-py) |
| TASK-0004 | Shared schemas package | ✅ Done | `packages/shared-schemas/src/schemas.ts` — Zod schemas for Design, Floor, Room, Fixture, Estimate, RateItem, User |
| TASK-0501 | UI asset intake folders | ✅ Done | `apps/mobile/assets/{brand,figma/screens,figma/components}`, `assets/README.md` |
| TASK-0502 | Asset-ingest pipeline script | ✅ Done | `scripts/assets-ingest.ts`, `pnpm assets:ingest` target |
| TASK-0503 | Design-tokens sync to Tamagui | ✅ Done | `apps/mobile/assets/figma/tokens.json` (brand colors, spacing, radius), `scripts/tokens-sync.ts`, `pnpm tokens:sync` |
| TASK-0504 | UI-generation task template | ✅ Done | `docs/design/_task_template.md` + `docs/design/flows/onboarding__archetype_picker.md` example |
| TASK-0505 | Brand assets pipeline | ✅ Done | `scripts/generate-brand-assets.ts`, Android density manifest; awaiting `logo.svg` drop |
| TASK-FE-0101 | Scaffold Expo RN app (New Architecture) | ✅ Done | `apps/mobile` — Expo SDK 51, newArchEnabled, TypeScript strict, Expo Router v3, Tamagui |
| TASK-FE-0102 | Tamagui + design tokens wired | ✅ Done | `apps/mobile/src/theme/tamagui.config.ts` — brand tokens, Inter + Cormorant Garamond fonts |
| TASK-FE-0201 | Mock API service | ✅ Done | `services/mock-api` — Fastify, all 7 stub endpoints, 12 Indian material fixtures (₹), hot-reload |
| TASK-FE-0301 | Fake auth provider + 5 auth screens | ✅ Done | `AuthContext`, Landing, Sign-in, Sign-up, Forgot Password, Verify Email screens |
| TASK-FE-0302 | Onboarding flow | ✅ Done | 3-step flow: Archetype (4 cards) → Location (20 cities, searchable) → Details (plot/budget, skippable) |

### Sprint 1 Acceptance Criteria

- [x] `pnpm install` succeeds on a fresh clone
- [x] `pnpm mock-api:dev` starts Fastify at port 4000
- [x] `curl http://localhost:4000/v1/rate-items` returns 12 ₹-priced items
- [x] App entry point routes to auth or onboarding based on user state
- [x] Typing any email/password signs in via mock API
- [x] New user flows through 3-step onboarding and lands on Designs list
- [x] Token persisted in SecureStore; app reopens to signed-in state
- [ ] App boots on `emulator-5554` — requires `logo.svg` in `assets/brand/` and `pnpm brand:generate`

---

## Sprint 2 — Canvas Harness + Floor Manager (Weeks 3–4)

**Goal:** Draw and move rooms on a 2D canvas with pinch-zoom, snap-to-grid, floor tabs.

**Status:** ✅ Complete

| Task ID | Title | Status | Story Points |
|---------|-------|--------|-------------|
| TASK-2001 | Skia canvas harness — pan, pinch-zoom, snap-to-grid, ruler | ✅ Done | 13 |
| TASK-2002 | Floor manager — add/remove/reorder floors, tabs | ✅ Done | 5 |
| TASK-2003 | Room primitive — draw, resize, type-picker, collision, warm palette | ✅ Done | 13 ↑ |
| Design system overhaul | Warm palette, dark CTAs, underline inputs (matches references) | ✅ Done | 5 |
| Currency formatter | ₹ lakhs/crores formatter + 39 unit tests | ✅ Done | 3 |
| 3D Model Viewer redesign | Isometric Skia view + zone overlays + material picker | ✅ Done | 13 |

**Sprint 2 total:** 52 pts completed (velocity increased)

### TASK-2001 Deliverables
- `src/canvas/` — types, constants, viewport transform math (pure TS, fully unit-tested)
- `useViewport` — Reanimated shared values for `tx`/`ty`/`scale`; simultaneous `Gesture.Pan + Gesture.Pinch` with focal-point zoom; `zoomToFit` helper
- `GridLayer` — Skia path-based grid built on the UI thread via `useDerivedValue`; 3 density levels (10 ft major / 1 ft minor / 6 in snap) that appear/disappear by zoom scale
- `RulerOverlay` — H+V rulers with tick paths (UI thread) and foot labels (JS thread via `useAnimatedReaction`)
- `CanvasView` — `GestureDetector` wrapping `Canvas`; content inside viewport `Group transform`; ruler rendered in screen space above content
- `usePerfHarness` — `useFrameCallback` rolling 60-frame FPS window; `formatPerfReport` outputs CI-ready JSON
- `app/(app)/canvas/[designId].tsx` — canvas screen; 100-room stress-test demo; ⏱ button records + displays perf report
- `jest.canvas.config.js` + `babel.canvas.config.js` — isolated node-env Jest config for pure math tests
- CI: `Canvas unit tests` step + `Upload perf report artifact` step added to mobile job
- **20/20 unit tests passing** (canvasToScreen, screenToCanvas, visibleRect, snapToGrid, snapPointToGrid, zoomAtFocalPoint, clampScale, firstGridLine)

---

## Sprint 3 — Fixtures, Finishes, CRUD, Undo/Redo (Weeks 5–6)

**Status:** 🔄 In Progress

| Task ID | Title | Status | Story Points |
|---------|-------|--------|-------------|
| TASK-2004 | Fixture tray — doors, windows, stairs | ✅ Done | 8 |
| TASK-2005 | Finishes palette — long-press room → floor/wall/ceiling/paint | ⬜ Pending | 5 |
| TASK-2006 | Design CRUD with auto-save (5s throttle) | ⬜ Pending | 8 |
| TASK-2007 | Undo/redo stack (50-step) | ⬜ Pending | 8 |
| TASK-2008 | Canvas performance hardening | ⬜ Pending | 5 |

**Sprint 3 total:** 34 pts (8 completed)

### TASK-2004 Deliverables
- `src/canvas/fixture/fixtureTypes.ts` — WallAnchor, DoorSpec, WindowSpec, StairSpec, CanvasFixture, TRAY_ITEMS
- `src/canvas/fixture/wallSnap.ts` — `roomWalls()`, `distToSegment()`, `snapToWall()` (WALL_SNAP_THRESHOLD=18 canvas units), `anchorToCanvasPos()`
- `src/canvas/fixture/useFixtureStore.ts` — Zustand store: addFixture, commitAnchor, removeFixture, selectFixture, updateSpec, setActiveTool
- `src/canvas/fixture/FixtureLayer.tsx` — Skia rendering: `buildDoorPath()` (leaf rect + swing arc), `buildWindowPath()` (pane dividers), `buildStairPath()` (step lines + direction arrow); `useDerivedValue` for full UI-thread rendering
- `src/canvas/fixture/FixtureTray.tsx` — horizontal tray with 🚪 Door / 🪟 Window / 🪜 Stairs buttons; tap-to-activate placement tool; active teal highlight
- `src/canvas/fixture/FixtureSpecSheet.tsx` — modal bottom sheet: DoorPanel (style/width/material), WindowPanel (style/width/height/glazing/panes), StairPanel (direction/width/run/risers); stepper + pills; delete button
- `src/canvas/__tests__/fixture.test.ts` — **25 unit tests** for wallSnap math: roomWalls, snapToWall, anchorToCanvasPos, WALL_SNAP_THRESHOLD
- Wired into `app/(app)/canvas/[designId].tsx`: tap near wall → snap + place; "Edit Fixture" in banner; FixtureSpecSheet opens on selection
- All canvas exports updated in `src/canvas/index.ts`
- **64/64 unit tests passing** across all canvas test suites

---

## Sprint 4 — Estimate Screen + PDF Export (Weeks 7–8)

**Status:** 🔜 Not Started

| Task ID | Title | Status | Story Points |
|---------|-------|--------|-------------|
| TASK-FE-0401 | Mock estimate calculator (Fastify endpoint) | ⬜ Pending | — |
| TASK-4001 | Estimate screen — materials, labour 40%, regional, overhead, total | ⬜ Pending | 5 |
| TASK-4002 | PDF estimate export (stubbed, writes to device storage) | ⬜ Pending | 3 |

**Sprint 4 total:** 8 pts + mock endpoint

---

## Deferred (Post-Frontend Sprint)

These tasks are explicitly out of scope for the frontend-first phase:

| Task | Reason deferred |
|------|----------------|
| TASK-0003 (Terraform) | No infra this phase |
| TASK-1001, TASK-1002 (Firebase + Java auth) | Real auth deferred |
| TASK-3001–3008 (Pricing service) | Stubbed by mock estimate |
| TASK-5001–5004 (Launch) | Post-MVP |
| Epic 6 (Doc ingestion) | Phase 2 |
| Epic 7 (Admin console) | Post-launch |
| Epic 8 (AI Layout Generator) | Phase 8 |

---

## Frontend-First Exit Criteria

On an Android emulator you can:
1. Sign up with any email/password
2. Complete the 3-step onboarding (archetype, location, optional details)
3. See an empty Designs list ✅
4. _(Sprint 2)_ Draw a 2-floor 4-room design
5. _(Sprint 2)_ Save it to the mock API
6. _(Sprint 4)_ Tap "Estimate" and see a ₹-denominated breakdown
7. _(Sprint 4)_ Export a stub PDF to device storage

Once Sprint 4 is complete → ready for real-backend Sprint 1.

---

## Velocity Tracking

| Sprint | Planned pts | Completed pts | Velocity |
|--------|------------|---------------|---------|
| Sprint 1 | ~35 (infra + shell) | 35 | ✅ |
| Sprint 2 | 26 | 52 (velocity +100%) | ✅ |
| Sprint 3 | 34 | 8 so far (TASK-2004) | 🔄 |
| Sprint 4 | 8 | — | — |
