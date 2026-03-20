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
Set `VITE_API_BASE_URL` in `.env`.

Use `.env.example` as the reference template.

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
- Detailed developer guidelines: [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md)

## Architecture Rules
- UI components call feature API modules, not raw HTTP clients directly.
- Shared HTTP and env access lives in `src/shared`.
- All routes are defined in `src/app/router.tsx`.

## Current Scope
This version is a structural skeleton with placeholder pages/components. Backend integration and arena business logic are next.
