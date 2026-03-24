# LLM Arena Frontend

## Overview
This frontend is the user interface for LLM Arena, a blind evaluation platform for comparing large language models through human preference voting.

The main flow is:
- a user enters one prompt
- the app requests a battle from the backend
- two anonymous responses are shown as answer A and answer B
- the user votes for the better answer, or marks them as equal
- the app can also show leaderboard and model-related views

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
- `http://localhost:5173/chatvote` for the arena voting page
- `http://localhost:5173/leaderboard` for leaderboard results
- `http://localhost:5173/about` for the about page

## Project Purpose
This frontend is responsible for:
- collecting the user prompt
- displaying two anonymized model responses
- sending votes back to the backend
- showing loading and error states
- presenting leaderboard and informational pages

The UI is built around blind comparison, fairness, and a simple evaluation flow.

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
