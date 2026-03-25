# LLM Arena Frontend

## Overview
This frontend is the user interface for LLM Arena, a platform for blind evaluation and direct exploration of large language models.

The main flow is:
- a user enters a prompt to start a battle
- the app requests a battle from the backend
- two anonymous answer streams are shown as answer A and answer B
- the user can continue the same battle with additional prompts across multiple turns
- the user votes on the full conversation transcript, or marks it as equal
- the app can also show leaderboard and model-related views
- the project also includes a direct chat mode where the user can choose a Vezilka model and chat with it normally

The project is focused on evaluating Macedonian fine-tuned LLMs alongside global providers.

## Tech Stack
- React
- TypeScript
- Vite
- React Router

## Quick Start
### Run with Docker
From inside this folder:

```bash
docker compose up --build
```

This starts:
- frontend on `http://localhost:5173`

### Run without Docker
```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
```

## Environment
Use `.env.example` as the template and create a local `.env` file.

Important variable:
- `VITE_API_BASE_URL`

Example:

`VITE_API_BASE_URL=http://127.0.0.1:8000`

## Main Routes
Useful local routes:
- `http://localhost:5173/` for the home page
- `http://localhost:5173/arena` for the arena voting page
- `http://localhost:5173/chat` for direct chat with a selected Vezilka model
- `http://localhost:5173/leaderboard` for leaderboard results
- `http://localhost:5173/about` for the about page

## Project Purpose
This frontend is responsible for:
- collecting the opening and follow-up prompts for a battle
- displaying two anonymized conversation streams
- sending conversation-level votes back to the backend
- letting users choose a Vezilka model and chat with it directly
- showing loading and error states
- presenting leaderboard and informational pages

The UI is built around blind comparison, fairness, a multi-turn evaluation flow, and a direct chat path for trying individual Vezilka models with more control.

## Local Compose Services
The local [docker-compose.yml](/Users/itonkdong/Work/Fax/INSOK/llm-arena/llm-arena-frontend/docker-compose.yml) in this folder starts only:
- `frontend`

This is useful when you want to run the backend separately or connect the frontend to an already running API.

## Production Docker
For a production-style deployment image with Nginx, use [Dockerfile.deployment](/Users/itonkdong/Work/Fax/INSOK/llm-arena/llm-arena-frontend/Dockerfile.deployment#L1).

It:
- builds the Vite app
- serves the compiled files with Nginx
- supports React Router SPA refreshes
- reads `VITE_API_BASE_URL` at container startup

## Project Context
This project was developed as part of the Vezilka project under the guidance of Assistant Teachers Ema Pandilova and Dimitar Peshevski.

The student developers are:
- Andrea Stevanoska
- Viktor Kostadinoski
- Gorazd Filipovski

All contributors listed above are from the Faculty of Computer Science and Engineering (FINKI), Skopje.

FINKI also developed, trained, and fine-tuned all Vezilka models used in this broader project context.
