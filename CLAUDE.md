# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-page laundry guidance application optimized for soft water households (~19 mg/L). Mobile-first SPA using vanilla HTML/CSS/JavaScript with no build tools or external dependencies.

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

Three lookup objects drive the calculator:
- `dosageData[size][soil]` - Base dose ranges in mL
- `colourData[colour]` - Temperature recommendations and adjustments
- `typeModifiers[type]` - Load type-specific modifications

### UI Pattern

Tab navigation switches between content sections. Collapsible panels (`.collapsible`) organize detailed information. The detergent cup SVG provides visual feedback for calculated doses. Dismissible `.key-fact` banners can be closed via `.key-fact-close` button.

### Key Functions (app.js)

- `updateResult()` - Main calculation function, called on any input change
- `setCalculator()` - Populates calculator from Quick Reference cards
- Event handlers for tabs, collapsibles, selectors, and close buttons
