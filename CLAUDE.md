# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Read CONTRACT.md at session start and follow all rules defined there.

## Project Overview

Single-page laundry guidance application optimized for soft water households (~19 mg/L). Mobile-first SPA using vanilla HTML/CSS/JavaScript with no build tools or external dependencies.

- **Repository:** https://github.com/dcszabo/laundry
- **Live site:** https://dcszabo.github.io/laundry/
- **Deployment:** GitHub Pages from master branch (no build step)

## Development

No build, test, or lint commands - static files that can be opened directly in a browser or served from any web server.

To develop: Open `index.html` in a browser. Refresh to see changes.

## Architecture

```
index.html   - HTML structure, tab-based navigation with 5 sections
styles.css   - CSS with custom properties, dark theme, mobile-first (breakpoint at 380px)
app.js       - Data-driven dosage calculator and UI event handlers
```

### Key Data Structures (app.js)

Four lookup objects drive the calculator:
- `dosageData[size][soil]` - Base dose ranges in mL
- `detergentTypes[type]` - Detergent type multipliers and guide keys
- `typeModifiers[type]` - Load type-specific modifications
- `presetMeta[preset]` - Per-preset tips, cautions, and recommended detergent type

### UI Pattern

Tab navigation switches between content sections. Collapsible panels (`.collapsible`) organize detailed information. The detergent cup SVG provides visual feedback for calculated doses. Dismissible `.key-fact` banners can be closed via `.key-fact-close` button. Detergent type/strength is selected via a compact bar that opens a bottom sheet modal.

### Key Functions (app.js)

- `updateResult()` - Main calculation function, called on any input change
- `renderQuickReference()` - Builds preset cards and binds click-to-load handlers
- Event handlers for tabs, collapsibles, selectors, and close buttons

### Sticky/Scroll Layout (Calculator Tab)

The calculator tab has a layered sticky layout:
- `.header` is `position: sticky; top: 0; z-index: 100`
- `.result-display-sticky` is `position: sticky; top: 80px; z-index: 40` with `background: var(--bg-primary)`
- `.calculator-card` scrolls normally with the page beneath the sticky result card
- A `::after` gradient on `.result-display-sticky` fades out content scrolling under it

**Important constraints — do NOT do any of the following:**
- **Do NOT change the `#calculator` section to `display: flex` with a fixed height.** This breaks the natural page flow and creates large gaps or clipped content. The section must remain `display: block`.
- **Do NOT add `overflow-y: auto` to `.calculator-card` to create an internal scroll area.** This creates two competing scroll regions (page scroll + card scroll) which feels broken on mobile touch devices.
- **Do NOT use negative `margin-bottom` on `.result-display-sticky` to pull the calculator card up behind it.** The sticky wrapper has `z-index: 40`, so its background paints over the card even at rest, hiding the top border before any scrolling occurs.
- **Do NOT make `.calculator-card` itself `position: sticky`.** Combined with internal scroll, this again creates two competing scroll areas on mobile.

### PWA Assets

Favicon and PWA icons configured in `index.html` and `site.webmanifest`:
- `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` - Browser favicons
- `apple-touch-icon.png` - iOS home screen (180x180)
- `android-chrome-192x192.png`, `android-chrome-512x512.png` - Android PWA icons
- `site.webmanifest` - Web app manifest for "Add to Home Screen" functionality

The header icon uses `android-chrome-192x192.png` scaled to 44x44px.

### Theme Colors

Dark theme defined in `:root` CSS custom properties:
- `--bg-primary: #0f1419` - Main background (also used in webmanifest)
- `--bg-secondary: #1a1f26` - Secondary background
- `--bg-card: #232a33` - Card backgrounds
- `--accent-blue: #4da3ff`, `--accent-cyan: #00d4aa` - Primary accents
