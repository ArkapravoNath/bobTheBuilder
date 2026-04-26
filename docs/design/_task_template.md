# UI-Generation Task Template

> Copy this file and fill in each section. Every `TASK-2xxx` screen implementation MUST include all sections.

---

## Screen: `<flow>__<screen_name>`

**Task ID:** `TASK-XXXX`
**Flow:** `<flow name>`
**Target Route:** `<React Navigation route name, e.g. Onboarding.ArchetypePicker>`

---

### Asset Paths

| Asset | Path |
|-------|------|
| Screen export | `apps/mobile/assets/figma/screens/<flow>__<screen>.png` |
| Manifest entry | `apps/mobile/assets/_manifest.json#<screen_name>` |
| Flow doc | `docs/design/flows/<flow>.md` |

---

### Data Dependencies

| Data | Source | Hook / Endpoint |
|------|--------|----------------|
| Example: User profile | Server | `useCurrentUser()` → `GET /v1/me` |

---

### Component Breakdown

List the main components this screen is composed of, referencing Tamagui primitives or custom components from `apps/mobile/src/components/`.

- `<ComponentName>` — purpose

---

### Navigation

- **Entry:** From `<previous route>` via `<navigation action>`
- **Exit (success):** Navigate to `<next route>`
- **Exit (cancel/back):** Navigate to `<back route>`

---

### Accessibility Notes

- [ ] All interactive elements have `accessibilityLabel` + `accessibilityRole`
- [ ] Minimum tap target 44 × 44 pt
- [ ] Dynamic type tested at +3 font size steps
- [ ] TalkBack/VoiceOver traversal order matches visual order
- [ ] Color contrast ≥ 4.5:1 for normal text

---

### Acceptance Criteria

- [ ] Screen matches Figma export pixel-parity within tolerance
- [ ] Happy path works end-to-end on Android emulator
- [ ] Empty state renders correctly
- [ ] Error state (network fail, validation) renders correctly
- [ ] Loading state shown while data is fetching

---

### Test Plan

| Test | Type | Notes |
|------|------|-------|
| Renders without crashing | Unit (RNTL) | |
| Correct data displayed | Unit (RNTL) | |
| Navigation on success | Integration | |
| Error state displayed | Unit (RNTL) | |
