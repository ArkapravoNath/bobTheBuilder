# Build Buddy — Frontend-First Sprint Kickoff

> Companion to `Bob_the_Builder_Task_List.md`. This document rewires the first ~4 sprints to build the mobile app against a local mock backend, so you can validate UX on a physical Android device while the real Java/Python services are built in parallel (or later).

## Locked decisions (do not re-debate)

- **Platform this phase:** Android emulator + device only. iOS added in a later phase.
- **Styling:** Tamagui, themed from `assets/figma/tokens/tokens.json`.
- **Auth:** Fake login — any email/password accepted. Real Firebase Auth deferred.
- **Mock backend:** Local Fastify server at `services/mock-api` serving JSON fixtures.
- **Currency / market:** ₹ INR, India-only.

## How this maps to the main plan

| Main-plan epic | Frontend-first posture |
| --- | --- |
| Epic 0 Foundations | In scope — **trimmed** (no Java, no Python-pricing, no AWS/Mongo) |
| Epic 0.5 Asset Intake | In scope as-is |
| Epic 1 Auth & Onboarding | In scope with **fake** auth provider |
| Epic 2 Design Canvas | In scope as-is |
| Epic 3 Pricing & Scraper | **Stubbed** — mock estimate endpoint returns a deterministic fake calculation |
| Epic 4 Estimate UX | In scope as-is (reads mock estimate) |
| Epic 5 Launch | Deferred |
| Epic 6 Phase 2 ingestion | Deferred |
| Epic 7 Admin Monitoring | Deferred |
| Epic 8 AI Layout Generator | Deferred |

Net effect: instead of ~150 pts for MVP, you're doing ~90 pts to reach a tappable prototype.

---

## New tasks specific to this phase

Add these to the main task list; they replace or precede the backend-heavy ones.

### TASK-FE-0101 · Scaffold Android-only RN 0.74 app with New Architecture
**Context.** Create `apps/mobile` as a bare RN 0.74+ project with Hermes + Fabric + TurboModules enabled. iOS target will stay in the project but is parked.
**Prereqs.** TASK-0001 (monorepo bootstrap).
**Deliverables.**
- `apps/mobile` with `react-native@0.74.x`, `react@18.x`, `newArchEnabled=true` in `gradle.properties`.
- `pnpm -C apps/mobile run android` boots the Metro server and launches on an emulator.
- TypeScript strict mode; ESLint + Prettier wired through root config.
**Acceptance.** App boots on `emulator-5554` to a "Hello Build Buddy" screen with the brand blue background.
**Out-of-Scope.** iOS build config beyond the scaffolding default.

### TASK-FE-0102 · Tamagui + design tokens wired
**Context.** Tokens already exist at `assets/figma/tokens/tokens.json`. Wire them into `tamagui.config.ts` so screens consume `$buddy.blue.500`, `$space.4`, etc. instead of raw values.
**Prereqs.** TASK-FE-0101.
**Deliverables.**
- `apps/mobile/tamagui.config.ts` generated from `tokens.json` by `scripts/tokens-to-tamagui.ts`.
- `pnpm run tokens:sync` re-runs the codegen.
- `Themed` provider wraps the app; a `<Button variant="primary">` demo uses `buddy.blue.500` with `buddy.blue.700` pressed state.
**Acceptance.** Changing a color value in `tokens.json`, running `pnpm run tokens:sync`, and hot-reloading reflects the change on-screen.

### TASK-FE-0103 · Android brand assets: icon, splash, adaptive icon
**Context.** Generate all Android icon densities + splash screen from `assets/brand/logo.svg`.
**Prereqs.** TASK-FE-0101; founder has dropped `logo.svg` into `assets/brand/`.
**Deliverables.**
- `@bam.tech/react-native-make` or `react-native-bootsplash` set up.
- Adaptive icon (foreground + background) generated per Android 8+ spec.
- Splash screen shows the logo on `#FFFFFF` background for ~1.2 s before the landing screen.

### TASK-FE-0201 · Mock API service (`services/mock-api`)
**Context.** A tiny Fastify server returning JSON fixtures. The app points at `http://10.0.2.2:4000` (Android emulator's alias for host machine).
**Prereqs.** TASK-0001.
**Deliverables.**
- `services/mock-api` with `fastify`, `@fastify/cors`, `zod`, `tsx` for hot-reload.
- Endpoints stubbed: `POST /v1/auth/session`, `GET /v1/me`, `PATCH /v1/me/onboarding`, `GET /v1/designs`, `POST /v1/designs`, `PUT /v1/designs/:id`, `POST /v1/designs/:id/estimate`, `GET /v1/rate-items`.
- Fixtures in `services/mock-api/fixtures/*.json` — at least 3 users, 5 designs, 10 rate items (Indian materials: cement, TMT steel, red bricks, vitrified tile, teak door, UPVC window, etc.) priced in ₹.
- `pnpm -C services/mock-api run dev` starts the server with `chokidar`-watched fixture reload.
**Acceptance.** `curl http://localhost:4000/v1/rate-items` returns 10 items with `₹`-priced `baseRate` values. Changing a fixture file reflects within 1 s.
**Out-of-Scope.** Persistence across restarts; mock server is stateless in-memory.

### TASK-FE-0202 · OpenAPI spec + generated TypeScript client
**Context.** The mock server and the app share types. Start the OpenAPI spec now so swapping to the real backend is a URL change.
**Prereqs.** TASK-FE-0201, TASK-0004 (shared-schemas).
**Deliverables.**
- `packages/shared-schemas/openapi.yaml` capturing the mock endpoints.
- `openapi-typescript` or `orval` generates `packages/api-client/src/generated/*.ts`.
- Mock server validates request/response against the same schema at runtime.
**Acceptance.** Breaking the response shape in the mock server produces a CI failure from the schema-validation test, *not* a silent runtime bug.

### TASK-FE-0301 · Fake auth provider + auth context
**Context.** Real auth is deferred. But the RN code should treat auth like it's real so the swap is painless.
**Prereqs.** TASK-FE-0102, TASK-FE-0202.
**Deliverables.**
- `apps/mobile/src/auth/` with an `AuthProvider` exposing `{user, signIn, signUp, signOut, requestReset}`.
- `signIn(email, password)` calls `POST /v1/auth/session` which the mock server accepts unconditionally and returns a fake JWT.
- Token stored in `react-native-keychain` (works on Android with the Android Keystore).
- All five auth screens (Landing, Sign-in, Sign-up, Forgot password, Verify email) rendered against Figma exports — built against `$tokens`.
- Signing out clears the token and sends user to Landing.
**Acceptance.** Typing any email/password signs in; closing and reopening the app keeps the user signed in.
**Out-of-Scope.** Password strength rules, real email verification, OAuth.

### TASK-FE-0302 · Onboarding flow (archetype + Indian-city location)
**Context.** After signup, user picks archetype and target city. Cities limited to the seed list of 20 Indian cities.
**Prereqs.** TASK-FE-0301.
**Deliverables.**
- Archetype screen with 4 cards: Single room / Partial home / Full house / Mansion.
- Location screen: searchable dropdown of 20 cities (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Thane, Bhopal, Visakhapatnam, Patna, Vadodara, Ghaziabad, Ludhiana) reading from mock API.
- Optional budget + plot-dimensions step (skippable).
- `PATCH /v1/me/onboarding` persists choices to mock.
**Acceptance.** Completing onboarding lands on an empty Designs list screen.

### TASK-FE-0401 · Mock estimate calculator
**Context.** The real pricing engine is deferred. Ship a dummy implementation that's *plausible* for screen validation.
**Prereqs.** TASK-FE-0201.
**Deliverables.**
- In `services/mock-api`, `POST /v1/designs/:id/estimate` implements: materials = `Σ rooms × ₹1,800 per sqft × finish multiplier`; fixtures = `count × fixture_rate`; labour = 0.40 × materials; regional = `{Mumbai: 1.25, Delhi: 1.18, Bengaluru: 1.22, else: 1.0}`; overhead = 12%.
- Response matches the real schema in `shared-schemas` so the Estimate screen code doesn't care it's fake.
**Acceptance.** A 3-room, 1000 sqft design in Mumbai returns a ₹-denominated estimate in the region of ₹30L with a full category breakdown.

---

## Reused tasks from the main list (unchanged)

Pull directly from `Bob_the_Builder_Task_List.md`:

- **Sprint 1:** TASK-0001, TASK-0002, TASK-0004 *(skip TASK-0003 Terraform — no infra this phase)*
- **Sprint 1:** TASK-0501, TASK-0502, TASK-0503, TASK-0504, TASK-0505 *(asset intake)*
- **Sprint 2:** TASK-1003 *(onboarding — use FE-0302 above as the implementation)*
- **Sprint 2:** TASK-2001, TASK-2002 *(Skia canvas harness, floor manager)*
- **Sprint 3:** TASK-2003, TASK-2004, TASK-2005 *(room / fixture / finishes)*
- **Sprint 3:** TASK-2006, TASK-2007, TASK-2008 *(design CRUD against mock, undo/redo, perf)*
- **Sprint 4:** TASK-4001 *(estimate screen)*
- **Sprint 4:** TASK-4002 *(PDF export — stubbed, writes to device storage, no email)*

Tasks dropped from this phase: TASK-1001, TASK-1002 (real Firebase + Java), TASK-3001–3008 (real pricing service), TASK-5001–5004 (launch), plus all Epic 6/7/8.

---

## Sprint plan (frontend-first)

| Sprint | Weeks | Goal | Tasks |
| --- | --- | --- | --- |
| **S1** | 1–2 | Tappable shell with auth + onboarding on a real Android emulator | TASK-0001, 0002, 0004, 0501–0505, FE-0101, FE-0102, FE-0103, FE-0201, FE-0202, FE-0301, FE-0302 |
| **S2** | 3–4 | Canvas harness + floor manager, draw & move rooms | TASK-2001, 2002, 2003 |
| **S3** | 5–6 | Fixtures, finishes, design persistence in mock, undo/redo | TASK-2004, 2005, 2006, 2007, 2008 |
| **S4** | 7–8 | Estimate screen + fake PDF export; end-to-end demo flow | FE-0401, TASK-4001, TASK-4002 |

**Exit criteria for frontend-first:** On an Android emulator you can sign up, onboard, draw a 2-floor 4-room design, save it, tap Estimate, and see a ₹-denominated breakdown you'd show a stakeholder without cringing. Then you're ready for real-backend Sprint 1.

---

## How to actually start Sprint 1

Assumes you have Node 20, pnpm, JDK 21, Android Studio + an AVD ready.

1. **Create the GitHub repo** locally and push it empty. Name: `buildbuddy` (or whatever you prefer).
2. **In the repo root, open Claude Code.** Run `claude` in your terminal inside the repo.
3. **First prompt to Claude Code:** paste the whole TASK-0001 block from `Bob_the_Builder_Task_List.md` and let it open a PR. Merge when green.
4. **Repeat per task in the S1 order above.** After each merge, run `pnpm -r test` and `pnpm -C apps/mobile run android` to smoke-check.
5. **At end of Sprint 1** (≈two weeks), you should be able to launch the app, sign in with any credentials, complete onboarding, and land on an empty Designs screen.

**Do not schedule all tasks at once.** Run one, review, merge, then schedule the next. The task list is dependency-ordered for exactly this.

If you want I can also generate a Sprint 1 checklist issue for GitHub Issues, or prep the first PR template — just say the word.
