# Build Buddy

**Residential Design & Cost-Estimation Platform — India**

> Internal codename: Bob the Builder

Build Buddy lets homeowners, architects, and small builders design a house on their phone — from a single room to a multi-storey mansion — then receive a transparent, location-adjusted cost estimate built from live material and labour rates.

---

## Architecture

```
buildbuddy/
├── apps/
│   └── mobile/          # React Native (Expo) — iOS & Android
├── services/
│   ├── mock-api/        # Fastify dev mock (frontend-first sprint)
│   ├── core-java/       # Spring Boot — users, designs, estimates
│   └── pricing-py/      # FastAPI — rate cards, pricing engine, scraper
├── packages/
│   └── shared-schemas/  # Zod schemas + generated TS / Java / Python types
├── infra/
│   └── terraform/       # AWS infra-as-code
├── scripts/             # Asset pipeline, token sync, brand generation
└── docs/                # Design spec, task list, sprint tracker
```

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node | 20 LTS (`nvm use`) |
| pnpm | 9+ |
| JDK  | 21 |
| Python | 3.12 |
| Android Studio + AVD | Latest |

### Install

```bash
nvm use          # switches to Node 20 per .nvmrc
pnpm install
```

### Run the mock API

```bash
pnpm mock-api:dev
# → http://localhost:4000
```

### Run the mobile app (Android emulator)

```bash
pnpm -C apps/mobile run android
```

### Sync design tokens

```bash
pnpm tokens:sync
```

### Ingest Figma assets

```bash
pnpm assets:ingest
```

---

## Sprint Status

| Sprint | Weeks | Status |
|--------|-------|--------|
| S1 — Tappable shell + auth | 1–2 | ✅ In Progress |
| S2 — Canvas harness | 3–4 | Pending |
| S3 — Fixtures, finishes, CRUD | 5–6 | Pending |
| S4 — Estimate screen + PDF | 7–8 | Pending |

See [`docs/Bob_the_Builder_Task_List.md`](docs/Bob_the_Builder_Task_List.md) for the full task list.

---

## Key Decisions

- **Currency:** ₹ INR, India-only MVP
- **Auth (Sprint 1):** Fake — any email/password accepted; real Firebase deferred
- **Mock backend:** Fastify at `http://10.0.2.2:4000` (Android emulator host alias)
- **Styling:** Tamagui themed from `apps/mobile/assets/figma/tokens.json`
- **Canvas:** `react-native-skia` (GPU-accelerated, handles pinch-zoom + complex shapes)
- **State:** Zustand (UI) + TanStack Query (server cache) + Jotai (canvas atoms)
