# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Read CONTRACT.md at session start and follow all rules defined there. Once read, reply "I've read the contract".
> CONTRACT.md is located at: `C:\Users\dcsza\OneDrive\Projects\laundry\CONTRACT.md`

---

## Operating Contract

CONTRACT.md v2.0 — located in the project root (`CONTRACT.md`). Read in full at session start. Defines personas (`@dev`, `@ux`), output rules, coding constraints, and session memory protocol.

---

## Project Overview

Single-page laundry guidance application optimised for soft water households (~18 mg/L total hardness as CaCO₃, Wantirna South VIC, Australia). Primary user is the owner on iPhone (Safari). Mobile-first SPA — vanilla HTML/CSS/JavaScript, no build tools, no external dependencies.

- **Repository:** https://github.com/dcszabo/laundry
- **Live site:** https://laundry-9zl.pages.dev/
- **GitHub mirror:** https://dcszabo.github.io/laundry/
- **Deployment workflow:** commit → push to GitHub → `npx wrangler pages deploy`

---

## Tech Stack

- HTML5 / CSS3 / ES6+ JavaScript — no framework, no bundler
- Google Fonts: DM Sans (body), Fraunces (headings/numbers)
- PWA: `site.webmanifest` + service worker (`sw.js`)
- Hosting: GitHub Pages

---

## Architecture

```
public/             — Cloudflare Pages deploy root (only this dir is deployed)
  index.html        — HTML structure, 4 tab sections, all SVG visuals inline
  styles.css        — CSS custom properties, dark theme, mobile-first (breakpoint 380px)
  app.js            — Calculator logic, UI event handlers, SVG animation
  sw.js             — Service worker (cache-first, bump cache name on each deploy)
  site.webmanifest  — PWA manifest
  *.png / *.ico     — Favicon and PWA icon assets
docs/research/research.md  — Laundry science: temperature matrix, detergent rules, dosage model (verified 2026-02-23, citations inline) — git only, not deployed
```

### Navigation

Fixed bottom tab bar — NOT inside `.app-container`. Lives just before the modal elements at the end of `<body>`:

```html
<div class="nav-tabs-wrapper">   ← position: fixed; bottom: 0
  <nav class="nav-tabs">
    <button class="nav-tab" data-section="...">
      <span class="tab-icon">emoji</span>
      <span class="tab-label">Label</span>
    </button>
  </nav>
</div>
```

- `viewport-fit=cover` on meta viewport — required for `env(safe-area-inset-bottom)` on iPhone
- `.nav-tabs-wrapper` has `padding-bottom: env(safe-area-inset-bottom)`
- `.app-container` has `padding-bottom: calc(72px + env(safe-area-inset-bottom))` so content clears the bar
- 4 tabs: Calculator, Rules, Machine, Care (Presets tab was removed — merged into calculator)

### Calculator Tab — Result Display Layout

The result display (`.result-display`) is a **3-column flex row**:

```
[cup SVG + detergent pill]   [dose / temp]   [washer SVG + load type pill]
       left (80px)              centre (flex:1)       right (80px)
```

- `.cup-container` and `.washer-container` both have `width: 80px` — fixed and equal, so centre metrics are always truly centred
- Each SVG column has a `.result-pill` button below the SVG (same fixed width as container)
- Detergent pill (`#detergentPill`): tapping opens the detergent bottom sheet
- Load type pill (`#loadTypePill`): tapping opens the load type bottom sheet
- `.result-row` — `display: flex; justify-content: space-between; align-items: center`
- `.result-text` — `flex: 1; text-align: center`
- `.result-dose-row` — dose value only, `justify-content: center` (`.result-value` is 48px Fraunces, unit 26px)
- `.result-temp-row` — temp badge only, `justify-content: center`, `margin-top: 4px`
- There is no cap comparison element — `#cupComparison` was removed

### Calculator Tab — Sticky Layout

- `.header` — `position: sticky; top: 0; z-index: 100`
- `.result-display-sticky` — `position: sticky; top: 68px; z-index: 40; background: var(--bg-primary)`
- `::after` gradient on `.result-display-sticky` fades content scrolling underneath — `opacity: 0` at rest, transitions to `1` when `.scrolled` class is present; JS scroll listener in `init()` toggles `.scrolled` on `window.scrollY > 8`
- `.preset-tip` (collapsible tips panel) — sits between result card and calculator card
- `.calculator-card` — scrolls normally beneath the sticky result

**Do NOT:**
- Change `#calculator` to `display: flex` with fixed height — breaks page flow
- Add `overflow-y: auto` to `.calculator-card` — creates two competing scroll regions on mobile
- Use negative `margin-bottom` on `.result-display-sticky` — z-index 40 background covers card at rest
- Make `.calculator-card` `position: sticky` — competing scroll on mobile

### Bottom Sheet Pattern

Both the detergent and load type selectors use a bottom sheet modal pattern:

```html
<div class="modal-backdrop" id="...Backdrop" hidden></div>
<div class="bottom-sheet" id="...Sheet" hidden>
  <div class="sheet-handle"></div>
  <div class="sheet-header">...</div>
  <div class="sheet-body">...</div>
</div>
```

- `openXxxSheet()` — unhides, forces reflow, adds `.visible` class for CSS transition
- `closeXxxSheet()` — removes `.visible`, listens for `transitionend` + `setTimeout(350)` fallback before setting `hidden`
- Backdrop click closes the sheet
- **Always add `setTimeout` fallback** when using `transitionend` — it can fail silently (rapid toggle, backgrounded tab)

### Collapsible Tips Panel (`#presetTip`)

- Sits between `.result-display-sticky` and `.calculator-card`
- `hidden` attribute controls visibility (show/hide the entire block)
- `.open` class controls collapsed/expanded state within the visible block
- `#presetTipToggle` — clickable header row with title + chevron SVG
- `#presetTipBody` — `max-height: 0` when collapsed, `max-height: 2000px` when `.open`
- Chevron rotates 180° on `.open`
- `updateLoadTypeTips()` sets `hidden = false` and adds `.open` only on first show (`wasHidden === true`); subsequent calls preserve the open/closed state

### SVG Visuals

#### Detergent Cup (left)
- `<rect id="liquidFill" class="cup-fill">` — fill rect animated via `updateCup(amount)`
- CSS `transition: all 0.5s ease` on `.cup-fill` — works because `y` and `height` are CSS geometry properties on `<rect>`
- Max fill = 75mL, maps linearly to SVG height

#### Washing Machine (right)
- Inline SVG with `<clipPath id="drumClip"><circle cx="40" cy="58" r="23"/></clipPath>`
- `<path id="drumFill">` — dome-shaped clothing fill, clipped to drum circle
- `<g id="drumSoil">` — 6 pre-positioned dots (show 2/4/6 based on soil level)
- Fill level: small = 25%, medium = 55%, large = 80% of drum height (cy=58, r=23, bottom=81, height=46)
- **CSS `transition: d` on `<path>` is NOT reliable on iOS Safari — use JS instead**
- Animation handled by `animateWasherFill(targetFillY, domeH)` using `requestAnimationFrame`
- Module-level `washerFillY` (current position) and `washerAnimId` (rAF handle) track animation state
- Fill colour mapped to colour category (see `colourFills` object in `updateWasher`)
- CSS `transition: fill 0.4s ease` handles colour transitions reliably

---

## Key Data Structures (app.js)

- `dosageData[size][soil]` — base dose in mL (small/medium/large × light/normal/heavy)
- `detergentTypes[type]` — `{ doseMultiplier, guideKey }` for liquid/powder/pods
- `tempMatrix[loadType][colour]` — recommended temperature for each load type × colour combination
- `cycleTemps[cycle]` — array of available temperatures for each cycle (used by `snapToNearest`)
- `cycleMaxLoad[cycle]` — max kg capacity per cycle (used by `updateSizeConstraints`)
- `sizeKg[size]` — kg value for each size button (small=3, medium=6, large=10)
- `loadTypeMeta[loadType]` — `{ emoji, label, defaultColour, defaultSoil, defaultSize, recommendedCycle, recDetergent, tips[], cautions[] }`
- `fallbackContent` — UI strings, tips, warnings, units
- `storageKeys` — localStorage key constants

### State Object

```js
const state = {
    size: 'medium',        // 'small' | 'medium' | 'large'
    soil: 'normal',        // 'light' | 'normal' | 'heavy'
    colour: 'mixed',       // 'whites' | 'lights' | 'colours' | 'darks' | 'mixed'
    cycle: 'everyday',     // 'everyday' | 'cottons' | 'heavy' | 'delicates' | 'wool' | 'quick' | 'bulky' | 'easyiron'
    detergent: 'liquid',   // 'liquid' | 'powder' | 'pods'
    concentration: 1,      // 0.7–1.3 (user slider)
    loadType: 'everyday'   // key into loadTypeMeta
};
```

---

## Key Functions (app.js)

- `updateResult()` — main recalculation, called on every state change and at init. Calls `updateSizeConstraints()`, `getDoseAndTemp()`, `updateCup()`, `updateWasher()`, `updateLoadTypeTips()`, `updateDetergentBar()`, `updateCycleIndicators()`, `updateCycleRec()`
- `getDoseAndTemp(size, soil, colour, loadType, cycle, detergentType)` — 6-arg core calculation, returns `{ dose, doseAmount, doseUnit, tempStr, isPods }`
- `snapToNearest(temp, available)` — snaps a temperature to the nearest available cycle temperature; ties prefer lower value (arrays sorted ascending)
- `updateSizeConstraints()` — disables size buttons exceeding `cycleMaxLoad[state.cycle]`, auto-corrects `state.size` if over limit
- `applyLoadTypeDefaults(loadType)` — sets `state.colour/soil/size/cycle` from `loadTypeMeta`, syncs all 4 button groups, calls `updateLoadTypePill()` and `updateResult()`
- `syncSelectorGroup(groupId, dataKey, value)` — toggles `.active` on selector buttons by dataset value
- `updateLoadTypePill()` — updates `#loadTypePill` text from `loadTypeMeta[state.loadType].label`
- `updateDetergentBar()` — updates `#detergentPill` text
- `updateLoadTypeTips()` — single source of all contextual text in the tips panel; builds: dynamic temp tip (colour-varying load types), cycle off-rec, detergent off-rec, active warnings, meta.tips, meta.cautions
- `updateCup(amount)` — animates cup fill level via CSS rect geometry transition
- `updateWasher(size, colour, soil)` — updates washer fill colour, dome level, soil dots
- `animateWasherFill(targetFillY, domeH)` — rAF tween for dome path animation
- `openDetergentSheet()` / `closeDetergentSheet()` — detergent bottom sheet
- `openLoadTypeSheet()` / `closeLoadTypeSheet()` — load type bottom sheet
- `syncLoadTypeSheetUI()` — syncs `.active` on load type sheet options to current state
- `setupSelectors()` — binds size/soil/colour/cycle/detergent button groups + concentration range
- `roundToFive(n)` — rounds dose to nearest 5mL throughout

### Dosage Calculation (`getDoseAndTemp`)

Calculation order:
1. `baseDose` from `dosageData[size][soil]`
2. Temperature derived from `tempMatrix[loadType][colour]` → snapped to `cycleTemps[cycle]` via `snapToNearest`
3. Temperature modifier applied to `baseDose`:
   - ≤20°C → ×1.12 (low enzyme activity, more detergent needed)
   - 30–40°C → ×1.00 (enzyme optimum, baseline)
   - ≥60°C → ×0.90 (thermal cleaning compensates)
4. `scaledDose = roundToFive(baseDose × concentration × detergentInfo.doseMultiplier)`
5. Pods bypass steps 1–4 entirely (fixed pod count based on size)

---

## Conventions and Patterns

- `ui` object — all DOM refs via `getElementById` at load time
- `setupSelector(groupId, dataKey, callback)` — generic button-group selector binding
- All selector buttons use `data-*` attributes; JS reads `dataset.*`
- Storage via `readStorage` / `writeStorage` wrappers around `localStorage`
- CSS custom properties in `:root` for all colours — never hardcode hex in components
- `triggerHaptic()` — lightweight haptic on state changes (mobile)

---

## Dependencies and Environment

- No package manager, no node_modules, no build step
- Fonts loaded from Google Fonts CDN (preconnect in `<head>`)
- Service worker cache name: `laundry-guide-v11` — **bump manually on each deploy**
- Dev: open `index.html` directly in browser; refresh to see changes
- Platform: Windows 11, bash shell — use Unix syntax, `git -C <path>` instead of `cd`
- **Deploy workflow:** `git add` → `git commit` → `git push` → `npx wrangler pages deploy` (all from project root; `wrangler.toml` sets project name and `pages_build_output_dir = "public"`; only the `public/` dir is uploaded to Cloudflare; GitHub Pages mirrors automatically on push)

---

## Known Issues and Pitfalls

### `cycleMaxLoad.wool` vs machine manual (accepted approximation)
- Machine manual specifies 2 kg max for the Wool cycle. The smallest size bucket is `small = 3 kg`, so there is no bucket that enforces the 2 kg limit via `updateSizeConstraints`.
- **Accepted:** the size buckets are coarser than the machine limit. A user-visible caution ("Machine limit is 2 kg — keep loads very small.") is rendered in red in the tips panel whenever Wool is the load type. Do not change `cycleMaxLoad.wool` to 2 — that would disable all size buttons and break the UI.

### SVG Animation
- **CSS `transition: d`** for SVG `<path>` d attribute does not work on iOS Safari — always use `requestAnimationFrame` tween
- SVG geometry attributes (`x`, `y`, `width`, `height`, `cx`, `cy`, `rx`, `ry`) on `<rect>` / `<ellipse>` ARE CSS-transitionable
- CSS `transition: all` on `.cup-fill` works because rect attributes are geometry properties

### iOS Safe Area
- `env(safe-area-inset-bottom)` returns 0 unless `viewport-fit=cover` is in the meta viewport tag
- Fixed bottom bars need `padding-bottom: env(safe-area-inset-bottom)` AND page needs matching `padding-bottom`

### Fixed Element Centering
- `position: fixed; left: 0; right: 0; max-width: 480px; margin: 0 auto` correctly centres a fixed element

### Flex Centering
- `text-align: center` on a flex container does NOT centre flex children — use `justify-content: center` on the row

### Sticky Layout (solved — do not revisit)
- See Calculator Tab section constraints above
- **Header height is 65px**, not 64px: `.water-badge` inherits `line-height: 1.6` from `body`, making its line box ~19px. Header-text height = h1 (24px) + gap (2px) + badge (19px) = 45px — taller than the icon (44px), so header-text drives the row. Total header = 12px (padding-top) + 45px + 8px (padding-bottom) = **65px**.
- **`top: 68px`** on `.result-display-sticky` gives 3px tolerance above the 65px header — element is pinned at load, never scrolls. If you reduce `top` to ≤ 64px the element scrolls 1–2px before sticking. Do not set `top` lower than 66px.

### Bottom Sheet `transitionend`
- `transitionend` can fail silently (rapid toggle, backgrounded tab) — always add `setTimeout(fn, 350)` fallback alongside `addEventListener('transitionend', fn)`

### `applyLoadTypeDefaults` calls `updateResult()`
- `applyLoadTypeDefaults` now calls `updateResult()` internally. Callers must not also call `updateResult()` immediately after — causes double calculation (harmless but wasteful). `init()` currently does this redundantly.

### `setupDetergentSheet` trigger element
- The detergent sheet is now triggered by `#detergentPill`, NOT `#detergentBar` (bar was removed). `setupDetergentSheet` binds to `ui.detergentPill`. This has been corrected once — do not revert to `detergentBar`.

### Pill width and centring
- Both `.cup-container` and `.washer-container` are fixed at `width: 80px`. Pills use `width: 100%; box-sizing: border-box` to fill the column. This ensures the centre `.result-text` (flex:1) always occupies the same space regardless of label length.

### Information Architecture
- Result card = numbers only (dose + temp). No warnings or tips inline.
- Tips panel (`#presetTip`) = all contextual text: dynamic temp tip, off-rec warnings, load-type tips, cautions — in that priority order.
- `updateCycleRec()` and `updateDetergentRec()` are always-hidden (stubs kept for call-site compatibility).

### Selector Button Hover (touch devices)
- `.selector-btn:hover` MUST stay inside `@media (hover: hover)` — bare `:hover` sticks on touch after tap, causing adjacent buttons to appear highlighted

### Cycle Indicator Checkmark
- `.selector-btn[data-recommended="true"]::after` uses `position: absolute; top: 3px; right: 3px` with `content: ''`, `width/height: 13px`, and an SVG circle-tick as `background-image` — inline `margin-left` causes button width change on toggle, triggering layout reflow and page shift
- `.selector-btn` has `position: relative` to support this — do not remove

### Tips Panel Scroll Anchoring
- `body` has `overflow-anchor: none` — intentional. `#presetTip` height changes when cycle changes; without this Chrome auto-adjusts `scrollTop` and the page appears to scroll
- `setupSelector` click handler calls `btn.blur()` after `updateResult()` — prevents focus-induced scroll on iOS Safari after tap

### Service Worker
- Uses `skipWaiting()` + `clients.claim()` for immediate activation
- Fetch handler scoped to same-origin only — cross-origin requests pass through
- Cache name is currently `laundry-guide-v11`

---

## PWA Assets

All in `public/`:
- `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` — browser favicons
- `apple-touch-icon.png` — iOS home screen (180×180)
- `android-chrome-192x192.png`, `android-chrome-512x512.png` — Android PWA icons
- Header icon: `android-chrome-192x192.png` scaled to 44×44px

---

## Theme Colours

```css
--bg-primary:    #0f1419   /* main background, also in webmanifest */
--bg-secondary:  #1a1f26   /* secondary background */
--bg-card:       #232a33   /* card backgrounds, bottom tab bar */
--accent-blue:   #4da3ff   /* primary accent */
--accent-cyan:   #00d4aa   /* secondary accent */
--accent-warm:   #ff9f43   /* temperature badges */
--accent-pink:   #ff6b9d   /* warnings, MAX label */
--accent-purple: #a855f7   /* machine section */
```

---

## Session Log

**2026-02-24 (session 3)** — Repo hygiene: added `.gitignore` (excludes `.wrangler/`, `.claude/settings.local.json`, OS junk). Untracked `.claude/settings.local.json` from git index. Moved all deployable app files into `public/` subdirectory; set `pages_build_output_dir = "public"` in `wrangler.toml` so only app files are uploaded to Cloudflare Pages. `docs/`, `CLAUDE.md`, `CONTRACT.md` remain tracked in git but stay at project root and are never deployed.

**2026-02-24 (session 2)** — Migrated deployment to Cloudflare Pages (primary) via Wrangler direct upload; GitHub Pages remains as mirror. Added `wrangler.toml`. Moved project root from `/laundry/laundry` → `/laundry` (one level up); updated CONTRACT.md path in CLAUDE.md. Bumped SW cache v10 → v11.

**2026-02-24 (session 1)** — Result card redesign: temp badge moved to its own row below dose; cap comparison removed; dose scaled to 48px/26px hero treatment; temp emoji removed, temp font 18px. Tip dividers removed. Tips toggle hover/active unified with `.collapsible-header` pattern. Result card `::after` gradient made scroll-triggered (opacity 0→1 on `scrollY > 8`). Header text tightened: h1 `margin: 0; line-height: 1.1`, `.header-text` flex column with `align-self: flex-start; gap: 2px`. Calculator section spacing standardised to 16px between all cards. `result-display-sticky` `top` corrected from 80px → 68px after header height changed from ~87px to 65px.

**2026-02-23 (session 2)** — Research verification: updated `docs/research/research.md` (UK→AU context, ~19 mg/L TDS → ~18 mg/L total hardness, powder multiplier ×0.9→×1.0, F&P WH1060P4 specs confirmed from manual, cycle guide added). Updated app.js to match. Bug fixes: (1) hover sticking on touch — wrapped in `@media (hover: hover)`; (2) recommended-cycle checkmark causing layout shift — `::after` now `position: absolute`; (3) tips panel height changes causing Chrome scroll anchoring scroll — `overflow-anchor: none` on body + `btn.blur()` in selector click handler.

**2026-02-23 (session 1)** — Major calculator redesign: merged Presets tab into Calculator. Load type becomes the primary selector (bottom sheet accessed via result card pill). Detergent settings moved to result card pill (was a bar in the calculator card). Temperature now derived from `tempMatrix[loadType][colour]` snapped to `cycleTemps[cycle]`. `cycleMaxLoad` + `updateSizeConstraints` greys out invalid load sizes. `updateLoadTypeTips` consolidates all contextual text (tips, warnings, off-rec notices) into a single collapsible panel between result card and calculator card. Information architecture: result card = numbers only, tips panel = all explanatory text.

**2026-02-20** — Replaced scrollable top nav with fixed bottom tab bar (iOS safe area, `viewport-fit=cover`). Added front-loader washing machine SVG to result display with animated dome-shaped clothing fill (rAF tween), colour-mapped fill, and soil dots. Centred result row to 3-column layout. Added temperature-based dose modifier (±10–12%).

**2026-01-?? (prior session)** — Redesigned load types, fixed content accuracy, simplified temperatures. Moved temp badge inline with dose value.
