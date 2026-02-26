# CLAUDE.md

> Read CONTRACT.md at session start and follow all rules defined there. Once read, reply "I've read the contract".
> CONTRACT.md is located at: `C:\Users\dcsza\OneDrive\Projects\laundry\CONTRACT.md`

---

## Operating Contract

CONTRACT.md v2.0 — project root. Defines personas (`@dev`, `@ux`), output rules, coding constraints, session memory protocol.

---

## Project Overview

Single-page laundry guidance app for a soft water household (~18 mg/L CaCO₃, Wantirna South VIC). Primary user on iPhone (Safari). Mobile-first SPA — vanilla HTML/CSS/JS, no build tools, no dependencies.

- **Repository:** <https://github.com/dcszabo/laundry>
- **Live site:** <https://laundry-9zl.pages.dev/>
- **Deployment:** commit → push → `npx wrangler pages deploy` (only on explicit "deploy" instruction)

---

## Tech Stack

- HTML5 / CSS3 / ES6+ — no framework, no bundler
- Google Fonts: DM Sans (body), Fraunces (headings/numbers)
- PWA: `site.webmanifest` + `sw.js` (cache-first; `orientation: portrait` ignored by iOS)
- Hosting: Cloudflare Pages (primary), GitHub Pages (mirror)

---

## Architecture

```text
public/             — Cloudflare Pages deploy root (only this dir is deployed)
  index.html        — HTML, 3 tab sections (calculator, rules/guide, machine), all SVGs inline
  styles.css        — CSS custom properties, dark theme, mobile-first (380px breakpoint)
  app.js            — Calculator logic, UI handlers, SVG animation
  sw.js             — Service worker; bump cache name on each deploy (currently v17)
  site.webmanifest  — PWA manifest
  *.png / *.ico     — Favicon and PWA icons
docs/research/
  research.md       — Verified laundry science: temp matrix, detergent rules, dosage model
  Fisher_Paykel_WH9060P4_WH1060P4_User_Guide.md — F&P manual (condensed)
```

### Navigation

Hamburger button (top-right of `.header-content`) opens `.nav-dropdown` (`position: absolute` inside the fixed `.header`, `top: 68px; right: 16px`). 3 sections: calculator, rules, machine.

- Active section shown via `.nav-dropdown-check` SVG, driven by `body.tab-{section}` CSS selector
- Open/close: `transitionend` + `setTimeout(200)` fallback (same pattern as bottom sheets)
- Escape key and outside-click both close the dropdown

### Fixed Header — Title Bar + Result Card

```text
.header (position: fixed; top:0; max-width:480px; margin:0 auto; z-index:100)
  ├── .header-content         (~68px)
  ├── .result-display-sticky  (plain block, padding-top:16px; hidden on non-calculator tabs)
  │     └── .result-display   (~129px)
  └── .nav-dropdown           (position:absolute; hidden by default)
```

- Calculator tab: `body.tab-calculator .app-container { padding-top: 202px }`
- Other tabs: `.app-container { padding-top: 68px }` (result card hidden via `display: none`)
- `body.tab-calculator .result-display-sticky { display: block }` shows result card
- Scroll-fade gradient: `.header::after`, opacity 0→1 when `.scrolled` on `.header` (toggled at `scrollY > 8`)
- `ui.resultDisplaySticky` → `document.querySelector('.header')` in app.js

**DO NOT:**
- Put result card inside `#calculator` — `fadeIn` on `.section` would bounce it
- Add `transform` back to `fadeIn` — makes `.section` a containing block for fixed descendants
- Add `position: fixed/sticky` to `.result-display-sticky` — already inside a fixed parent
- Add `overflow-y: auto` to `.calculator-card` — competing scroll region on mobile

### Result Display Layout

3-column flex row: `[cup SVG + detergent pill]  [dose / temp]  [washer SVG + load type pill]`

- Left/right columns: `width: 80px` fixed. Centre: `flex: 1; text-align: center`
- `#detergentPill` → opens detergent bottom sheet
- `#loadTypePill` → opens load type bottom sheet

### Bottom Sheet Pattern

`openXxxSheet()` — unhide → force reflow → add `.visible` for CSS transition
`closeXxxSheet()` — remove `.visible` → `transitionend` + `setTimeout(350)` fallback → set `hidden`
**Always add `setTimeout` fallback** — `transitionend` fails silently on rapid toggle / backgrounded tab.

### Collapsible Sections (Guide, Machine tabs)

All collapsibles start **closed** (no `open` class in HTML). `bindCollapsibles()` handles toggle.
Machine tab uses `.section-subheader` (`<h3>`) to divide machine specs collapsibles from care collapsibles.

Tips panel (`#presetTip`): `hidden` attr = visibility; `.open` class = expanded. `updateLoadTypeTips()` only auto-opens on first show (`wasHidden === true`); subsequent calls preserve state.

### SVG Visuals

**Cup (left):** `<rect id="liquidFill" class="cup-fill">` animated via `updateCup(amount)`. `transition: all 0.5s ease` works on rect geometry attributes. Max fill = 75 mL.

**Washer (right):** `<clipPath id="drumClip">` clips `<path id="drumFill">` dome. Animation via `animateWasherFill(targetFillY, domeH)` using rAF. **CSS `transition: d` does NOT work on iOS Safari** — always use rAF. Colour: `transition: fill 0.4s ease` (reliable).

---

## Key Data Structures (app.js)

- `dosageData[size][soil]` — base dose mL (small/medium/large × light/normal/heavy)
- `tempMatrix[loadType][colour]` — recommended temperature
- `cycleTemps[cycle]` — available temps per cycle (used by `snapToNearest`)
- `cycleMaxLoad[cycle]` — max kg per cycle (used by `updateSizeConstraints`)
- `loadTypeMeta[loadType]` — `{ emoji, label, defaultColour, defaultSoil, defaultSize, recommendedCycle, recDetergent, tips[], cautions[] }`
- `detergentTypes[type]` — `{ doseMultiplier, guideKey }`
- `sizeKg[size]` — small=3, medium=6, large=10

```js
const state = {
    size: 'medium',      // 'small' | 'medium' | 'large'
    soil: 'normal',      // 'light' | 'normal' | 'heavy'
    colour: 'mixed',     // 'whites' | 'lights' | 'colours' | 'darks' | 'mixed'
    cycle: 'everyday',   // 'everyday' | 'cottons' | 'heavy' | 'delicates' | 'wool' | 'quick' | 'bulky' | 'easyiron'
    detergent: 'liquid', // 'liquid' | 'powder' | 'pods'
    concentration: 1,    // 0.7–1.3
    loadType: 'everyday'
};
```

---

## Key Functions (app.js)

- `setActiveSection(sectionId)` — single source of truth for tab switching; sets `body.tab-*`
- `updateResult()` — main recalculation on every state change
- `getDoseAndTemp(size, soil, colour, loadType, cycle, detergentType)` → `{ dose, doseAmount, doseUnit, tempStr, isPods }`
- `snapToNearest(temp, available)` — snaps temp to nearest available; ties prefer lower
- `updateSizeConstraints()` — disables size buttons over `cycleMaxLoad[state.cycle]`
- `applyLoadTypeDefaults(loadType)` — sets state + syncs button groups; calls `updateResult()` internally (callers must not call it again)
- `updateLoadTypeTips()` — single source for all tips panel content
- `animateWasherFill(targetFillY, domeH)` — rAF tween for dome path
- `roundToFive(n)` — rounds dose to nearest 5 mL

### Dosage Calculation (`getDoseAndTemp`)

1. `baseDose` from `dosageData[size][soil]`
2. Temp from `tempMatrix[loadType][colour]` → snapped via `snapToNearest`
3. Temp modifier: ≤20°C → ×1.12 | 30–40°C → ×1.00 | ≥60°C → ×0.90
4. `scaledDose = roundToFive(baseDose × concentration × doseMultiplier)`
5. Pods bypass entirely — fixed pod count by size

---

## Conventions

- `ui` object — all DOM refs at load time
- Selector buttons use `data-*` attrs; JS reads `dataset.*`
- `body.tab-{sectionId}` class — use for all tab-conditional CSS
- CSS custom properties for all colours — never hardcode hex in components
- Inter-card spacing: **16px** throughout
- Storage: `readStorage` / `writeStorage` wrappers around `localStorage`
- Information architecture: result card = numbers only; tips panel = all contextual text
- `updateCycleRec()` and `updateDetergentRec()` are stubs (always hidden) — kept for call-site compatibility
- `.tip-note` — secondary/restriction line inside a tip item (12px, `--text-muted`, `display: block`, `margin-top: 2px`)
- `.section-subheader` — in-section grouping label (11px, uppercase, `--text-muted`; used in Machine tab to divide specs from care)

---

## Environment

- No package manager, no node_modules, no build step
- SW cache: `laundry-guide-v18` — **bump on every deploy** (string in `sw.js`)
- **PDF reading:** `Read` tool fails on Windows (pdftoppm not installed). Use `pdfplumber` via Bash: `python -c "import pdfplumber; ..."`. Add `sys.stdout.reconfigure(encoding='utf-8')` when parsing files containing emoji.
- Dev: open `public/index.html` in browser, refresh to see changes
- Platform: Windows 11, bash shell (Unix syntax)
- Deploy root: `public/` only (`wrangler.toml` sets `pages_build_output_dir = "public"`)

---

## Known Issues and Pitfalls

**`transform` on `.section` breaks fixed descendants**
`fadeIn` is opacity-only. Never add `transform` back — makes `.section` a containing block for fixed children, bouncing the result card on tab switch.

**`cycleMaxLoad.wool` accepted at 3 kg (manual says 2 kg)**
Setting to 2 kg disables all size buttons. Accepted: caution shown in tips panel for Wool.

**`applyLoadTypeDefaults` calls `updateResult()` internally**
Callers must not call `updateResult()` again. `init()` does this redundantly (harmless but wasteful).

**Detergent sheet trigger**
Bound to `#detergentPill`, not `#detergentBar` (removed). Do not revert.

**Cycle indicator checkmark**
`.selector-btn[data-recommended="true"]::after` uses `position: absolute` SVG background. Do not use `margin-left` — causes layout reflow. `.selector-btn` needs `position: relative`.

**Tips panel scroll anchoring**
`body { overflow-anchor: none }` — intentional. `setupSelector` calls `btn.blur()` after `updateResult()` to prevent focus-scroll on iOS.

**iOS: no orientation lock**
`site.webmanifest` `"orientation": "portrait"` and `screen.orientation.lock()` both ignored by iOS. CSS landscape guard (`body::before` overlay) is the only mitigation.

**Vinegar contraindicated**
Do not recommend white vinegar as a softener alternative — acetic acid degrades rubber door gaskets.

**Cycle capacities (F&P manual confirmed)**
Bulky: 4 kg, Cold–90°C. Easy Iron: 4 kg, Cold–60°C. Wool: 2 kg (app uses 3 kg — see above).
90°C available on Cottons, Heavy, Bulky, and Drum Clean — not Drum Clean only.

**Selector button hover (touch)**
`.selector-btn:hover` MUST stay inside `@media (hover: hover)` — bare `:hover` sticks on touch after tap.

**Removing a nav section requires 3 touchpoints**
HTML (nav button + `<section>` element), JS (`SECTION_SUBTITLES`), CSS (checkmark selector `body.tab-X`).

---

## Theme Colours

```css
--bg-primary: #0f1419   --bg-secondary: #1a1f26   --bg-card: #232a33
--accent-blue: #4da3ff  --accent-cyan: #00d4aa    --accent-warm: #ff9f43
--accent-pink: #ff6b9d  --accent-purple: #a855f7
```

---

## Session Log

**2026-02-26 (session 8)** — Full content audit against F&P PDF (pdfplumber). Added to Guide tab: scrud explanation, softener cycle restrictions (not with Quick/Steam Refresh). Added to Machine tab: Detergent Requirements converted to collapsible (moved to top), pods placement warning, nappy/bleach warning, beach towel tip for single bulky items. Added pods red warning to tips panel (`dynamicItems`, fires when `state.detergent === 'pods'`). Deleted `.bottom-note` block and CSS. Renamed Rules → Guide (nav + section header). Merged Machine Care into Machine tab under `.section-subheader`; removed maintenance section, nav item, JS subtitle entry, CSS checkmark. Added `.tip-note` and `.section-subheader` CSS classes. **SW cache v17 still not bumped — bump to v18 on next deploy.**

**2026-02-26 (session 7)** — Cycle Options audit: read F&P PDF user guide (pp. 22–27) via pdfplumber. All 8 options confirmed real. Descriptions rewritten in index.html with verified content: cycle restrictions, incompatibilities, Pre Wash compartment detail, Quiet→Wrinkle Free auto-enable link, Soak 30-min duration confirmed. Added `.tip-note` CSS class for restriction lines. research.md TODO removed; verified Cycle Options table added. **SW cache v17 still not bumped — bump to v18 on next deploy.**

**2026-02-25 (session 6)** — Content audit of Rules, Machine, Machine Care tabs against research.md and F&P manual. Corrections: NHS→NSW Health, bleach→bio detergent, temperature table restructured (whites split: 100% cotton 60°C / synthetic 40°C max), softener never-list expanded (towels/activewear/wool/delicates), vinegar tip removed (gasket degradation), 90°C availability corrected (Cottons/Heavy/Bulky/Drum Clean), Easy Iron and Bulky capacity corrected to 4 kg, Steam Refresh merged into Available Cycles collapsible, Drum Clean renamed "every 100 cycles", machine card padding equalised. research.md updated to match. **SW cache not bumped — bump to v18 on next deploy.**

**2026-02-24 (session 5)** — Navigation redesigned: bottom tab bar → hamburger dropdown inside `.header`. Result card hidden on non-calculator tabs via `body.tab-{section}`. All collapsibles default closed. Drum Clean Reminder banner removed. SW cache v16 → v17.

**2026-02-24 (sessions 1–4)** — Fixed header/result card tab-switch bounce (fadeIn opacity-only; result card moved into `.header`). 16px spacing standardised. Migrated to Cloudflare Pages, `public/` deploy root established. Research verified (AU sources, F&P manual, water quality data). SW cache v14 → v16.
