# Contributing

## Overview
Thank you for contributing to the LLM Arena frontend.

This folder contains the React frontend for:
- blind multi-turn arena battles
- conversation-level voting
- direct chat with selected Vezilka models

## Before You Start
- read the local [README.md](/Users/itonkdong/Work/Fax/INSOK/llm-arena/llm-arena-frontend/README.md)
- use `.env.example` as the template
- never commit secrets or real API keys

## Development Flow
- make focused changes
- keep the current routes and product behavior consistent
- update docs when setup or UI behavior changes
- prefer small, reviewable pull requests

## Docker And Environment
- use the local `docker-compose.yml` when working on the frontend

## Code Guidelines
- preserve the current React and routing structure
- keep UI changes intentional and easy to review
- avoid unrelated refactors in the same change
- make sure battle flow and chat flow remain clear

## Pull Requests
- explain what changed and why
- mention any env, route, or deployment impact
- include screenshots for UI changes when useful
- call out known gaps or follow-up work

## Security
- do not commit `.env` files
- rotate leaked keys immediately
- verify Docker build context and `.dockerignore` before publishing images
