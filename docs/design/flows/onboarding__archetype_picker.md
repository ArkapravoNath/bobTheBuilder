# Screen: onboarding__archetype_picker

**Task ID:** `TASK-FE-0302`
**Flow:** `Onboarding`
**Target Route:** `Onboarding.ArchetypePicker`

---

### Asset Paths

| Asset | Path |
|-------|------|
| Screen export | `apps/mobile/assets/figma/screens/onboarding__archetype_picker.png` |
| Flow doc | `docs/design/flows/onboarding__archetype_picker.md` |

---

### Screen Intent

After first sign-up, the user picks their build archetype so the app can tune defaults (floor-height, room minimums, estimate baseline).

**Four cards:**
1. **Single Room** — renovating or building one room
2. **Partial Home** — a wing, floor, or apartment renovation
3. **Full House** — complete build or gut renovation
4. **Mansion** — luxury multi-storey project

Each card shows: an illustrative line-art icon, the archetype name, a one-line description, and the typical sqft range for India.

---

### Data Dependencies

| Data | Source | Hook |
|------|--------|------|
| Selected archetype | Local state | `useState<Archetype>` |
| Persist archetype | Server (mock) | `PATCH /v1/me/onboarding` |

---

### Navigation

- **Entry:** From `Auth.SignUp` (new user) or `Auth.SignIn` (onboarding incomplete flag)
- **Exit (success):** Navigate to `Onboarding.LocationPicker`
- **Exit (back):** Disabled — first onboarding step

---

### Accessibility Notes

- [ ] Cards are `accessibilityRole="radio"` with `accessibilityState.selected`
- [ ] Minimum tap target: entire card (≥ 120pt height)
- [ ] Selected card has a visible indicator beyond color alone

---

### Acceptance Criteria

- [ ] All four archetype cards render
- [ ] Tapping a card selects it (highlighted border, checkmark)
- [ ] "Continue" CTA is disabled until a card is selected
- [ ] Tapping "Continue" calls `PATCH /v1/me/onboarding` with `{ archetype }`
- [ ] On success, navigates to LocationPicker

---

### Test Plan

| Test | Type |
|------|------|
| All four cards render | Unit (RNTL) |
| Selecting a card updates state | Unit (RNTL) |
| Continue disabled without selection | Unit (RNTL) |
| PATCH called with correct payload | Integration (MSW) |
