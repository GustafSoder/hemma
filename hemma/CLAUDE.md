# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build → dist/hemma/
npm test           # Unit tests (Karma + Jasmine)
npm run watch      # Build in watch mode
```

## What This Is

**Hemma** is a Stockholm public transport departures display app. It fetches real-time departure data from the [SL Transport API](https://transport.integration.sl.se/v1) and renders departures for a configured station (currently Karlaplan, site ID 9192). It supports dark/light theming with localStorage persistence and auto-refreshes every 30 seconds.

## Architecture

Angular 19 standalone components. No NgModules. All state via Angular Signals.

```
src/app/
  core/
    models/        # TypeScript interfaces for SL API responses
    service/       # SlTransportService — all HTTP calls to SL API
  features/
    header/        # App header with nav and theme toggle
    departures/    # Main departures display (signals-based state)
  pages/
    home/          # Default route, composes features
  shared/
    button/        # Generic button (variants: primary, secondary, ghost, danger)
  misc/
    themes/
      svc/         # ThemeService (signal-based), theme-variables.scss (CSS custom props)
      theme-toggle/ # UI toggle component
environments/
  enironment.ts    # Note: intentional(?) typo — contains slApiKey
```

**Routing** is defined in `app.routes.ts`: home is the default, wildcard redirects there. `app.config.ts` wires up `provideHttpClient()`, `provideRouter()`, and `provideAnimationsAsync()`.

**SL API** calls use an API key passed as an HTTP query param (`key`). The key lives in `environments/enironment.ts` (note the filename typo — missing an 'n').

**Theme** CSS custom properties are defined in `misc/themes/svc/theme-variables.scss` and applied as `[data-theme="dark"]` / `[data-theme="light"]` attributes on `<html>`. `ThemeService` reads system preference on init and persists the user's choice to localStorage.

## TypeScript Config

Strict mode is fully enabled (`strict: true`, `strictTemplates`, `noImplicitReturns`, etc.). Module resolution is `bundler`, target is ES2022.
