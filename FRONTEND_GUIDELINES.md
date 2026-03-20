# Frontend Developer Guidelines

## Why this structure
We use a feature-first structure so product behavior stays grouped by domain as the app grows.

- `app` handles app wiring.
- `features` handles domain behavior.
- `shared` holds reusable infrastructure.
- `tests` is reserved for integration and scenario tests.

## Structure and how to use each part

### `src/app`
- `router.tsx`: single source of truth for routes (`/`, `/arena`, `/settings`).
- `layout/AppLayout.tsx`: shared shell (header/nav/main) and `<Outlet />` rendering.
- `main.tsx`: bootstraps app and mounts `RouterProvider`.

Use `app` for composition and wiring only, not business logic.

### `src/features`
Each folder is one product area and can contain its own pages, components, API helpers, hooks, and types.

- `features/home`: simple entry/overview experience.
- `features/arena`: main flow (prompt -> two answers -> vote).
- `features/settings`: app/runtime settings.

For arena specifically:
- `pages/ArenaPage.tsx` orchestrates the arena screen.
- `components/*` contains UI parts for prompt, answer pair, and voting controls.
- `api/arenaApi.ts` contains arena-specific backend calls.
- `types.ts` contains arena domain types like vote choice and round shape.

### `src/shared`
Cross-feature code only.

- `config/env.ts`: read env values like `VITE_API_BASE_URL`.
- `network/httpClient.ts`: generic HTTP wrapper.
- `ui/`: reusable presentational components.
- `lib/`: generic utilities.
- `types/`: only truly shared types (used by multiple features).

If code is used by only one feature, keep it in that feature.

### `src/tests`
Integration-style tests that cover cross-feature or route flows.

## Architecture rules
- UI/page/component -> feature API -> shared network client -> backend API.
- Do not call raw `fetch` directly from UI components.
- Keep all route registration in `src/app/router.tsx`.
- Keep feature types local unless shared by multiple features.

## Naming conventions
- Components/pages/layouts: `PascalCase`.
- Utility functions/services/helpers: `camelCase`.
- One component per file by default.

## Current scope
This repo currently contains a skeleton with placeholders and wiring. Arena business logic and real backend integration will be added incrementally.
