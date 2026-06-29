# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FUENI** — a digital health platform for Francophone Africa. Dual-audience: patients and healthcare professionals. SSR React app deployed to Cloudflare Workers.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run preview    # Preview production build
npm run lint       # ESLint
npm run format     # Prettier (writes in place)
```

No test runner is configured.

## Tech Stack

- **Framework:** TanStack Start (SSR React) + TanStack Router (file-based) + TanStack React Query
- **Language:** TypeScript 5.8 strict mode
- **Build:** Vite 7 + Cloudflare Vite Plugin (targets Cloudflare Workers)
- **Styling:** Tailwind CSS 4 + `cva` + `tailwind-merge`
- **Components:** Radix UI primitives (headless), Lucide icons, shadcn/ui pattern in `src/components/ui/`
- **Forms:** react-hook-form + Zod
- **i18n:** i18next + react-i18next — French (`fr`) is `DEFAULT_LOCALE`, English (`en`) supported

## Architecture

### Routing

TanStack Router with file-based routes under `src/routes/`. The generated tree lives in `src/routeTree.gen.ts` (auto-updated by the dev server — do not hand-edit).

Route hierarchy:

- `__root.tsx` — root layout, error boundary, NotFound component
- `index.tsx` — bare `/` redirects to `/$locale`
- `$locale.tsx` — locale layout wrapper; validates `locale` param against `SUPPORTED_LOCALES`
- `$locale.index.tsx` — public landing page
- `$locale.login.tsx` — dual-audience login (`?audience=patient|pro`)
- `$locale.signup.tsx` — professional signup
- `$locale.inscription.tsx` — patient signup
- `$locale.mot-de-passe-oublie.tsx` — forgot password
- `$locale.espace-patient.*` — patient dashboard layout + sub-pages (index, profil, securite)

Underscore-prefixed segments (`_layout`) create layout groups without adding a URL segment.

### State Management

- **Server/async state:** TanStack React Query (`QueryClient` instantiated in `src/router.tsx` and passed via router context)
- **Form state:** react-hook-form + Zod schemas defined inline per route
- **Local UI state:** React `useState`
- No global client state library (Redux, Zustand, etc.)

### Internationalization

Locale is the first dynamic URL segment (`/:locale/…`). i18next is initialized in `src/i18n/index.ts`; translation dictionaries are in `src/i18n/locales/fr.ts` and `src/i18n/locales/en.ts`. Always add keys to both locale files when adding new copy.

### Server Entry

- `src/server.ts` — Cloudflare Workers fetch handler
- `src/start.ts` — TanStack Start middleware; catches render errors and returns a branded HTML error page via `src/lib/error-page.ts`

### Styling Conventions

Global CSS variables for the brand gradient and shadow tokens are defined in `src/styles.css` (`--gradient-brand`, `--gradient-soft`, `--shadow-*`). Use `cn()` from `src/lib/utils.ts` (wraps `clsx` + `tailwind-merge`) for conditional class composition.

## Current State

This is an active prototype with sprint-based TODOs throughout the code:

- Keycloak authentication is not yet wired (Sprint 3 target)
- API calls use `window.location.href` redirects as placeholders
- Marketing copy in landing page is provisional pending team validation

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
