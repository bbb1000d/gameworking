# Rogue Tier

This repository contains the monorepo for **Rogue Tier**, a top-down action shooter with an authoritative backend, deterministic ECS core, and extensive meta systems. The project is organised into a Turborepo with shared TypeScript tooling across the client, server, and shared packages.

## Project layout

- `apps/client` – React + PixiJS front-end powered by Vite.
- `apps/server` – Fastify API server with Prisma ORM and PostgreSQL.
- `packages/shared` – Common types, math utilities, ECS framework, and gameplay content definitions.

## Getting started

1. Install [pnpm](https://pnpm.io/).
2. Install dependencies: `pnpm install`.
3. Start database and services: `docker-compose up -d`.
4. Apply database migrations and seed content: `pnpm --filter @rogue/server db:migrate && pnpm --filter @rogue/server db:seed`.
5. Start development servers:
   - API: `pnpm --filter @rogue/server dev`
   - Client: `pnpm --filter @rogue/client dev`

## Testing

- Client unit tests: `pnpm --filter @rogue/client test`
- Server tests: `pnpm --filter @rogue/server test`
- Shared package tests: `pnpm --filter @rogue/shared test`

Playwright end-to-end scenarios live under `apps/client/tests/e2e` and can be executed with `pnpm --filter @rogue/client test:e2e` after booting the API and database.

## Deployment

Dockerfiles for the client and server are provided alongside a `docker-compose.yml` that orchestrates the stack locally. CI is configured through GitHub Actions (`.github/workflows/ci.yml`) to lint, test, and build all packages.

## License

CC0 placeholder assets are used for development and can be replaced with production art. Code is licensed under the MIT license.
