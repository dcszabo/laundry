# changes.md

## Change Requests

### 1. Add cycle & recommended options to result card

**Goal:** Show the selected cycle name and context-aware recommended cycle options (Rinse+, Wash+, Soak, Pre Wash, etc.) in the result card, beneath dose/temp.

---

#### Task 1 — Data: define recommended options per load type

Add a `recOptions` array to each entry in `loadTypeMeta` (app.js). Mappings derived from research.md and F&P manual:

| Load Type   | Recommended Options        | Rationale                                                    |
|-------------|----------------------------|--------------------------------------------------------------|
| Everyday    | —                          | No special options needed for casual clothing                |
| Towels      | Rinse+                     | Body-contact textile; extra rinse removes detergent residue  |
| Bedding     | Pre Wash                   | Large items trap soil; pre-wash loosens before main cycle    |
| Underwear   | Rinse+                     | Hygiene-critical; extra rinse for sensitive skin contact     |
| Delicates   | —                          | Minimal agitation preferred; no boosters                     |
| Wool        | —                          | Minimal agitation preferred; no boosters                     |
| Activewear  | Rinse+                     | Removes trapped detergent from wicking micropores            |
| Jeans       | —                          | Standard wash sufficient                                     |

Additionally, apply **soil-based** overrides (any load type):
- Heavy soil → add `Wash+` and/or `Soak` if not already present
- These fire regardless of load type (heavy towels, heavy bedding, etc.)

Store as: `recOptions: ['rinseplus']` using keys that match the Cycle Options table in research.md. Provide a display-label lookup (e.g., `{ rinseplus: 'Rinse+', washplus: 'Wash+', soak: 'Soak', prewash: 'Pre Wash' }`).

---

#### Task 2 — HTML: add cycle info row to result card

Insert after `.result-temp-row` inside `.result-text` (index.html ~line 110):

```html
<div class="result-cycle-row">
    <span class="cycle-label" id="cycleLabel">Everyday</span>
    <span class="cycle-options" id="cycleOptions"></span>
</div>
```

- `#cycleLabel` — displays the currently selected cycle name (e.g., "Everyday", "Cottons")
- `#cycleOptions` — populated dynamically with recommended option pills; empty/hidden when none apply

---

#### Task 3 — CSS: style changes

**3a. Reduce dose font size:**
- `.result-value` — `font-size: 48px` → `36px`
- `@media` small breakpoint (line ~1225) — `font-size: 26px` → `22px`

**3b. Strip temp badge chrome:**
- `.temp-badge` — remove `padding`, `background`, `border-radius`. Keep `color: var(--accent-warm)`, `font-size: 18px`, `font-weight: 600`. Render as plain inline text.

**3c. New `.result-cycle-row`:**
```css
.result-cycle-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 4px;
    flex-wrap: wrap;
}

.cycle-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
}

.cycle-option-pill {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--text-secondary);
}
```

**3d. Adjust padding-top:**
- `body.tab-calculator .app-container` — `padding-top: 202px` → `~220px` (test exact value after implementation; target is no overlap with new row)

---

#### Task 4 — JS: populate cycle row on every state change

In `app.js`:

1. Add `ui.cycleLabel` and `ui.cycleOptions` refs to the `ui` object.
2. Create `updateCycleDisplay()`:
   - Set `ui.cycleLabel.textContent` to the capitalised `state.cycle` name.
   - Build recommended options: merge `loadTypeMeta[state.loadType].recOptions` with soil-based additions (heavy → Wash+/Soak).
   - For each option, create/reuse a `<span class="cycle-option-pill">` inside `ui.cycleOptions`.
   - If no options, hide `ui.cycleOptions`.
3. Call `updateCycleDisplay()` at the end of `updateResult()`.

---

#### Acceptance criteria

- Result card shows: dose (smaller), temp (no badge background), cycle name, and 0–3 option pills
- Options update reactively when load type, soil, or cycle changes
- No height overflow on iPhone SE (375px) — verify the card fits
- No change to existing bottom sheet or tips panel behaviour
