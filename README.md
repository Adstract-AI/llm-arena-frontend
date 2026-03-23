# LLM Arena Frontend

## Project Overview
LLM Arena is a blind comparison interface for two LLMs. A user submits one prompt, receives two anonymous answers, and votes on the result using one of four outcomes:
- `modelA`
- `modelB`
- `bothGood`
- `bothBad`

## Tech Stack
- Vite
- React
- TypeScript
- React Router

## Getting Started
```bash
npm install
npm run dev
```

```bash
npm run build
npm run lint
```

## Environment
Set a direct backend base URL in `.env`:

`VITE_API_BASE_URL=http://127.0.0.1:8000`

Use `.env.example` as the reference template.

## Docker
From the repository root, you can run the full stack with Docker Compose:

```bash
docker compose up --build
```

This starts:
- frontend on `http://localhost:5173`
- backend on `http://localhost:8000`
- postgres on `localhost:5432`

For a production-style frontend image with Nginx, use `Dockerfile.render`.
It builds the Vite app, serves it through Nginx, supports React Router SPA routes, and reads `VITE_API_BASE_URL` at container startup.

If you only want the frontend from inside this folder, run:

```bash
docker compose up --build
```

## Project Structure
```text
src/
  app/
    layout/
      AppLayout.tsx
    router.tsx
  features/
    home/
      pages/
        HomePage.tsx
    arena/
      pages/
        ArenaPage.tsx
      components/
        PromptInput.tsx
        ResponsePair.tsx
        VotePanel.tsx
      api/
        arenaApi.ts
      types.ts
    settings/
      pages/
        SettingsPage.tsx
  shared/
    config/
      env.ts
    network/
      httpClient.ts
    ui/
    lib/
    types/
  tests/
```

- `app`: app-level shell and centralized route registration.
- `features`: product areas grouped by domain (home, arena, settings).
- `shared`: reusable cross-feature configuration, network, UI, and utilities.
- Detailed developer guidelines: [FRONTEND_GUIDELINES.md](agents_metadata/FRONTEND_GUIDELINES.md)

## Architecture Rules
- UI components call feature API modules, not raw HTTP clients directly.
- Shared HTTP and env access lives in `src/shared`.
- All routes are defined in `src/app/router.tsx`.

## Current Scope
This version is a structural skeleton with placeholder pages/components. Backend integration and arena business logic are next.
