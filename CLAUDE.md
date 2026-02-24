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

- **Repository:** <https://github.com/dcszabo/laundry>
- **Live site:** <https://laundry-9zl.pages.dev/>
- **GitHub mirror:** <https://dcszabo.github.io/laundry/>
- **Deployment workflow:** commit → push to GitHub → `npx wrangler pages deploy`
- **IMPORTANT:** Only run `npx wrangler pages deploy` when the user explicitly says "deploy". Never assume it follows from commit/push.

---

## Tech Stack

- HTML5 / CSS3 / ES6+ JavaScript — no framework, no bundler
- Google Fonts: DM Sans (body), Fraunces (headings/numbers)
- PWA: `site.webmanifest` + service worker (`sw.js`) — `orientation: portrait` set (ignored by iOS — see Known Issues)
- Hosting: Cloudflare Pages (primary), GitHub Pages (mirror)

---

## Architecture

```text
public/             — Cloudflare Pages deploy root (only this dir is deployed)
  index.html        — HTML structure, 4 tab sections, all SVG visuals inline
  styles.css        — CSS custom properties, dark theme, mobile-first (breakpoint 380px)
  app.js            — Calculator logic, UI event handlers, SVG animation
  sw.js             — Service worker (cache-first, bump cache name on each deploy)
  site.webmanifest  — PWA manifest (orientation: portrait)
  *.png / *.ico     — Favicon and PWA icon assets
docs/research/research.md  — Laundry science: temperature matrix, detergent rules, dosage model (verified 2026-02-23, citations inline) — git only, not deployed
```

### Navigation

Hamburger button (top-right of header) opens a dropdown panel. No bottom tab bar.

```html
<!-- inside .header-content, rightmost child -->
<button class="hamburger-btn" id="navMenuBtn" aria-expanded="false" aria-haspopup="menu">

<!-- inside .header, after .result-display-sticky -->
<div class="nav-dropdown" id="navDropdown" role="menu" hidden>
  <button class="nav-dropdown-item" data-section="calculator" role="menuitem">...</button>
  <!-- rules / machine / maintenance -->
</div>
```

- `.nav-dropdown` is `position: absolute` inside `.header` (which is `position: fixed`), appearing below `.header-content`
- Open/close follows the same `transitionend` + `setTimeout(200)` fallback pattern as bottom sheets
- Active section indicated by `.nav-dropdown-check` SVG, shown via `body.tab-{section}` CSS selector
- Escape key and outside-click both close the dropdown
- `viewport-fit=cover` on meta viewport — required for `env(safe-area-inset-bottom)` on iPhone
- `.app-container` has `padding-bottom: calc(24px + env(safe-area-inset-bottom))` (no bar to clear)
- 4 sections: calculator, rules, machine, maintenance

### Fixed Header — Combined Title Bar + Result Card

`.header` is `position: fixed; top: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto; z-index: 100`. It contains the title bar, the result card, and the nav dropdown:

```text
.header (position: fixed)
  ├── .header-content        ← icon + title + water badge + hamburger-btn (~68px)
  ├── .result-display-sticky ← plain block, padding-top: 16px (hidden on non-calculator tabs)
  │     └── .result-display  ← the result card (~129px)
  └── .nav-dropdown          ← position: absolute; top: 68px; right: 16px (hidden by default)
```

- **Calculator tab header height: ~202px** — `body.tab-calculator .app-container { padding-top: 202px }`
- **Compact header height: ~68px** (all other tabs, result card hidden) — `.app-container { padding-top: 68px }` (base)
- `.result-display-sticky` has NO positioning — just `padding-top: 16px` (creates 16px gap below title bar)
- **Result card visibility:** `body.tab-calculator .result-display-sticky { display: block }` — hidden by default via `display: none`
- **Scroll-fade gradient:** `.header::after` — `position: absolute; top: 100%; height: 28px` gradient. `opacity: 0` at rest, `1` when `.scrolled` class is present
- **`scrolled` class** is toggled on `.header` by the JS scroll listener (`window.scrollY > 8`). In `app.js`, `ui.resultDisplaySticky` points to `document.querySelector('.header')`
- All inter-card gaps are **16px** consistently (header→result card via padding-top, result card→tips via tips `margin-top: 16px`, tips→calculator via calculator-card `margin-top: 16px`)

**Do NOT:**

- Put the result card back inside `#calculator` section — tab-switch `fadeIn` animation would cause it to bounce (see pitfall below)
- Add `position: fixed` or `position: sticky` back to `.result-display-sticky` — it's intentionally a plain block inside the already-fixed header
- Change `#calculator` to `display: flex` with fixed height — breaks page flow
- Add `overflow-y: auto` to `.calculator-card` — creates two competing scroll regions on mobile
- Make `.calculator-card` `position: sticky` — competing scroll on mobile

### Calculator Tab — Result Display Layout

The result display (`.result-display`) is a **3-column flex row**:

```html
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

- Sits between the fixed header and `.calculator-card` in the scroll flow
- `hidden` attribute controls visibility (show/hide the entire block)
- `.open` class controls collapsed/expanded state within the visible block
- `#presetTipToggle` — clickable header row with title + chevron SVG
- `#presetTipBody` — `max-height: 0` when collapsed, `max-height: 2000px` when `.open`
- Chevron rotates 180° on `.open`
- `updateLoadTypeTips()` sets `hidden = false` and adds `.open` only on first show (`wasHidden === true`); subsequent calls preserve the open/closed state

### Collapsible Sections (Rules, Machine, Care tabs)

All collapsibles start **closed by default** (no `open` class in HTML). The `bindCollapsibles()` function handles toggle via `.collapsible-header` click.

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

- `setActiveSection(sectionId)` — switches active `.section`, swaps `body.tab-*` class, updates `.water-badge` subtitle. Single source of truth for tab switching.
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
- `openNavDropdown()` / `closeNavDropdown()` — hamburger nav dropdown
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

- `ui` object — all DOM refs via `getElementById` / `querySelector` at load time
- `setupSelector(groupId, dataKey, callback)` — generic button-group selector binding
- All selector buttons use `data-*` attributes; JS reads `dataset.*`
- Storage via `readStorage` / `writeStorage` wrappers around `localStorage`
- CSS custom properties in `:root` for all colours — never hardcode hex in components
- `triggerHaptic()` — lightweight haptic on state changes (mobile)
- Inter-card spacing: **16px** throughout (margin-top on cards, padding-top on wrappers)
- `body.tab-{sectionId}` class — set by `setActiveSection()` on every tab switch and seeded in `init()`. Drives CSS rules for result card visibility and nav dropdown checkmarks. Use this for any tab-conditional styling.

---

## Dependencies and Environment

- No package manager, no node_modules, no build step
- Fonts loaded from Google Fonts CDN (preconnect in `<head>`)
- Service worker cache name: `laundry-guide-v17` — **bump manually on each deploy**
- Dev: open `public/index.html` directly in browser; refresh to see changes
- Platform: Windows 11, bash shell — use Unix syntax, `git -C <path>` instead of `cd`
- **Deploy workflow:** `git add` → `git commit` → `git push` → `npx wrangler pages deploy` (all from project root; `wrangler.toml` sets project name and `pages_build_output_dir = "public"`; only the `public/` dir is uploaded to Cloudflare; GitHub Pages mirrors automatically on push)

---

## Known Issues and Pitfalls

### `transform` on animated ancestor breaks `position: fixed` descendants

- Per CSS spec, any element with a `transform` (including during a CSS animation) becomes the containing block for all `position: fixed` descendants. The fixed child positions relative to the transformed ancestor, not the viewport.
- **This was the root cause of the result card tab-switch bounce.** The `.section` `fadeIn` animation used `transform: translateY(8px)`, which caused the fixed result card inside it to offset on every tab switch.
- `fadeIn` is now opacity-only. **Never add `transform` back to `fadeIn` or any animation on `.section`.**
- The fix: result card now lives inside `.header` (always rendered, never animated), not inside `.section`.

### iOS overscroll / rubber-band

- `position: sticky` elements can shift slightly during iOS rubber-band overscroll (negative scrollY). Use `position: fixed` for elements that must never move.
- Both `.header` and its contents are `position: fixed` — immune to rubber-band.

### `cycleMaxLoad.wool` vs machine manual (accepted approximation)

- Machine manual specifies 2 kg max for the Wool cycle. The smallest size bucket is `small = 3 kg`, so there is no bucket that enforces the 2 kg limit via `updateSizeConstraints`.
- **Accepted:** a user-visible caution is rendered in red in the tips panel for Wool. Do not change `cycleMaxLoad.wool` to 2 — that would disable all size buttons and break the UI.

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

### Bottom Sheet `transitionend`

- `transitionend` can fail silently (rapid toggle, backgrounded tab) — always add `setTimeout(fn, 350)` fallback alongside `addEventListener('transitionend', fn)`

### `applyLoadTypeDefaults` calls `updateResult()`

- `applyLoadTypeDefaults` now calls `updateResult()` internally. Callers must not also call `updateResult()` immediately after — causes double calculation (harmless but wasteful). `init()` currently does this redundantly.

### `setupDetergentSheet` trigger element

- The detergent sheet is triggered by `#detergentPill`, NOT `#detergentBar` (bar was removed). `setupDetergentSheet` binds to `ui.detergentPill`. Do not revert to `detergentBar`.

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
- Cache name is currently `laundry-guide-v17`

### Landscape / Portrait

- `site.webmanifest` has `"orientation": "portrait"` — **iOS/WebKit ignores this field entirely**, even for installed PWAs. It has no effect on iPhone.
- `screen.orientation.lock()` is also unsupported in iOS Safari/WKWebView. There is no web API to prevent rotation on iOS.
- CSS `@media (orientation: landscape) and (max-height: 600px)` shows a rotate-device overlay via `body::before` — this is the only available mitigation for iOS.
- Android Chrome supports `screen.orientation.lock()` in fullscreen mode, but this app does not use fullscreen.

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

**2026-02-24 (session 5)** — Navigation redesigned: bottom tab bar removed, replaced with hamburger dropdown inside `.header`. Result card hidden on non-calculator tabs via `body.tab-{section}` class. All collapsibles default to closed. Drum Clean Reminder banner and all related JS/CSS removed. Info note added to Monthly Drum Clean. Confirmed iOS ignores `"orientation": "portrait"` in webmanifest — no web API can lock orientation on iOS. SW cache v16 → v17.

**2026-02-24 (session 4)** — Fixed overscroll and tab-switch layout bugs. Both `.header` and result card are now `position: fixed`; result card merged inside `.header` so it is structurally immune to tab-switch animation recompositing. Root cause of bounce: `fadeIn` used `transform: translateY(8px)` which made `.section` a containing block for fixed descendants — removed transform, animation is now opacity-only. Added portrait lock (`site.webmanifest` + CSS landscape guard). Spacing standardised to 16px between all header/card gaps. SW cache v15 → v16. Deployment rule established: only deploy on explicit user instruction.

**2026-02-24 (session 3)** — Repo hygiene: added `.gitignore`, moved app files into `public/`, set `pages_build_output_dir = "public"` in `wrangler.toml`.

**2026-02-24 (sessions 1–2)** — Result card redesign (hero dose, temp badge row, scroll-triggered gradient). Migrated to Cloudflare Pages. Sticky layout tuned (header 65px, result card top: 68px).

**2026-02-23 (session 2)** — Research verification, AU context, powder multiplier, F&P manual. Bug fixes: hover sticking, checkmark layout shift, scroll anchoring.

**2026-02-23 (session 1)** — Major calculator redesign: Presets merged into Calculator, load type as primary selector, detergent pill, tempMatrix + cycleTemps architecture, tips panel.

**2026-02-20** — Fixed bottom tab bar, washing machine SVG, rAF dome animation, temperature dose modifier.
