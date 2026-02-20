# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Read CONTRACT.md at session start and follow all rules defined there. Once read, reply "I've read the contract".
> CONTRACT.md is located at: `C:\Users\dcsza\OneDrive\Projects\laundry\laundry\CONTRACT.md`

---

## Operating Contract

CONTRACT.md v2.0 — located in the project root (`CONTRACT.md`). Read in full at session start. Defines personas (`@dev`, `@ux`), output rules, coding constraints, and session memory protocol.

---

## Project Overview

Single-page laundry guidance application optimised for soft water households (~19 mg/L). Primary user is the owner on iPhone (Safari). Mobile-first SPA — vanilla HTML/CSS/JavaScript, no build tools, no external dependencies.

- **Repository:** https://github.com/dcszabo/laundry
- **Live site:** https://dcszabo.github.io/laundry/
- **Deployment:** GitHub Pages from `master` branch (no build step — push to deploy)

---

## Tech Stack

- HTML5 / CSS3 / ES6+ JavaScript — no framework, no bundler
- Google Fonts: DM Sans (body), Fraunces (headings/numbers)
- PWA: `site.webmanifest` + service worker (`sw.js`)
- Hosting: GitHub Pages

---

## Architecture

```
index.html      — HTML structure, 5 tab sections, all SVG visuals inline
styles.css      — CSS custom properties, dark theme, mobile-first (breakpoint 380px)
app.js          — Calculator logic, UI event handlers, SVG animation
sw.js           — Service worker (cache-first, bump cache name on each deploy)
```

### Navigation

The nav is a **fixed bottom tab bar** — it is NOT inside `.app-container`. It lives just before the modal elements at the end of `<body>`:

```html
<div class="nav-tabs-wrapper">   ← position: fixed; bottom: 0
  <nav class="nav-tabs">
    <button class="nav-tab" data-section="...">
      <span class="tab-icon">emoji</span>
      <span class="tab-label">Label</span>
    </button>
    ...
  </nav>
</div>
```

- `viewport-fit=cover` is set on the `<meta viewport>` tag — required for `env(safe-area-inset-bottom)` to return a non-zero value on iPhone
- `.nav-tabs-wrapper` has `padding-bottom: env(safe-area-inset-bottom)` for home indicator clearance
- `.nav-tabs` has `padding: 0 env(safe-area-inset-right) 0 env(safe-area-inset-left)` for landscape/corner safety
- `.app-container` has `padding-bottom: calc(72px + env(safe-area-inset-bottom))` so content clears the bar
- JS tab switching uses `.nav-tab[data-section]` — moving the wrapper does not affect JS

### Calculator Tab — Result Display Layout

The result display (`.result-display`) is a **3-column flex row**:

```
[cup SVG]   [dose + temp + cap text]   [washer SVG]
 left                centre               right
```

- `.result-row` — `display: flex; justify-content: space-between; align-items: center`
- `.result-text` — `flex: 1; text-align: center`
- `.result-dose-row` and `.result-meta-row` both have `justify-content: center` (required because they are flex containers — `text-align` alone does not centre flex children)

### Calculator Tab — Sticky Layout

- `.header` — `position: sticky; top: 0; z-index: 100`
- `.result-display-sticky` — `position: sticky; top: 80px; z-index: 40; background: var(--bg-primary)`
- `.calculator-card` — scrolls normally beneath the sticky result
- `::after` gradient on `.result-display-sticky` fades content scrolling underneath

**Do NOT:**
- Change `#calculator` to `display: flex` with fixed height — breaks page flow
- Add `overflow-y: auto` to `.calculator-card` — creates two competing scroll regions on mobile
- Use negative `margin-bottom` on `.result-display-sticky` — z-index 40 background covers card at rest
- Make `.calculator-card` `position: sticky` — competing scroll on mobile

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
- Default path (medium load): `M 17 56 Q 40 49 63 56 L 63 90 L 17 90 Z`
- **CSS `transition: d` on `<path>` is NOT reliable on iOS Safari — use JS instead**
- Animation handled by `animateWasherFill(targetFillY, domeH)` using `requestAnimationFrame`
- Module-level `washerFillY` (current animated position) and `washerAnimId` (rAF handle) track state
- Fill colour mapped to colour category (see `colourFills` object in `updateWasher`)
- CSS `transition: fill 0.4s ease` handles colour transitions reliably

### Key Data Structures (app.js)

- `dosageData[size][soil]` — base dose in mL
- `detergentTypes[type]` — dose multipliers and guide text
- `typeModifiers[type]` — load type dose adjustments
- `presetMeta[preset]` — per-preset tips, cautions, recommended detergent, cycle, maxLoad
- `fallbackContent` — all UI strings, temp mappings, tips, reference data

### Dosage Calculation (`getDoseAndTemp`)

Calculation order:
1. `baseDose` from `dosageData[size][soil]` + `typeModifiers[type].doseAdjust`
2. Temperature modifier applied to `baseDose`:
   - Cold / ≤20°C → ×1.12 (low enzyme activity)
   - 30–40°C → ×1.00 (baseline, enzyme optimum)
   - ≥60°C → ×0.90 (thermal cleaning compensates)
3. `scaledDose = roundToFive(baseDose × concentration × detergentInfo.doseMultiplier)`
4. Pods bypass steps 1–3 entirely

### Key Functions (app.js)

- `updateResult()` — main recalculation, called on every state change and at init
- `updateCup(amount)` — animates cup fill level
- `updateWasher(size, colour, soil)` — updates washer fill colour, dome level, soil dots
- `animateWasherFill(targetFillY, domeH)` — rAF tween for dome path animation
- `renderQuickReference()` — builds preset cards; must be re-called when detergent type or concentration changes
- `getDoseAndTemp(size, soil, colour, type, detergentType)` — core calculation, returns dose + temp + tips

### Preset Cards (Quick Reference Tab)

Each card shows: emoji + label, chips (soil, colour, cycle, maxLoad), then `dose · temp` on one row. Labels removed from dose/temp — units (`mL`, `°C`) are self-labelling.

---

## Conventions and Patterns

- `ui` object — all DOM refs via `getElementById` at load time
- `state` object — `{ size, soil, colour, type, detergent, concentration, activePreset }`
- `setupSelector(groupId, stateKey)` — generic button-group selector binding
- All selector buttons use `data-*` attributes; JS reads `dataset.*`
- Storage via `readStorage` / `writeStorage` wrappers around `localStorage`
- CSS custom properties in `:root` for all colours — never hardcode hex in components
- `roundToFive(n)` — rounds dose to nearest 5mL throughout

---

## Dependencies and Environment

- No package manager, no node_modules, no build step
- Fonts loaded from Google Fonts CDN (preconnect in `<head>`)
- Service worker cache name: `laundry-guide-v2` — **bump manually on each deploy**
- Dev: open `index.html` directly in browser; refresh to see changes
- Platform: Windows 11, bash shell — use Unix syntax, `git -C <path>` instead of `cd`

---

## Known Issues and Pitfalls

### SVG Animation
- **CSS `transition: d`** for SVG `<path>` d attribute does not work reliably on iOS Safari — always use `requestAnimationFrame` tween instead
- SVG geometry attributes (`x`, `y`, `width`, `height`, `cx`, `cy`, `rx`, `ry`) on `<rect>` and `<ellipse>` ARE CSS-transitionable — use these where possible
- CSS `transition: all` on `.cup-fill` works because rect attributes are geometry properties

### iOS Safe Area
- `env(safe-area-inset-bottom)` returns 0 unless `viewport-fit=cover` is in the meta viewport tag
- Fixed bottom bars must have `padding-bottom: env(safe-area-inset-bottom)` AND the page needs `padding-bottom: calc(barHeight + env(safe-area-inset-bottom))`

### Fixed Element Centering
- `position: fixed; left: 0; right: 0; max-width: 480px; margin: 0 auto` correctly centres a fixed element — verified working

### Flex Centering
- `text-align: center` on a flex container parent does NOT centre flex children
- Must use `justify-content: center` on the flex row itself

### Sticky Layout (do not revisit — solved)
- See constraints in Calculator Tab section above — these have been broken and fixed before

### JS
- `renderQuickReference()` is called once at init — any state change affecting dose display (detergent type, concentration) must re-call it or preset cards show stale values
- CSS `transitionend` can fail silently (rapid toggle, backgrounded tab) — always add `setTimeout` fallback when using it to gate `hidden`/`display` state changes

### Service Worker
- Uses `skipWaiting()` + `clients.claim()` for immediate activation
- Fetch handler scoped to same-origin only — cross-origin requests pass through

---

## PWA Assets

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

**2026-02-20** — Replaced scrollable top nav with fixed bottom tab bar (iOS safe area, `viewport-fit=cover`). Added front-loader washing machine SVG to result display with animated dome-shaped clothing fill (rAF tween), colour-mapped fill, and soil dots. Centred result row to 3-column layout. Condensed preset cards to single dose·temp row. Added temperature-based dose modifier (±10–12%) derived from existing colour→temp mapping.

**2026-01-?? (prior session)** — Redesigned load types, fixed content accuracy, simplified temperatures. Moved temp badge inline with dose value.
