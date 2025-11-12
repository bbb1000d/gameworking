# Rogue Tier v2

Rogue Tier v2 is a top-down action prototype that runs across three TypeScript packages:

- **`apps/client`** – Vite + React renderer powered by PixiJS.
- **`apps/server`** – Fastify API with Prisma/PostgreSQL for persistence.
- **`packages/shared`** – Gameplay engine, math helpers, and strongly-typed content consumed by both runtime targets.

The repository is organised as a Turborepo workspace so every package shares a single `node_modules` folder.

## Prerequisites

1. **Node.js 18 or newer**. Corepack ships with Node and lets you activate pnpm.
2. **pnpm 8**. Run `corepack prepare pnpm@8.15.4 --activate` after installing Node. If your network blocks registry downloads,
   install pnpm from <https://pnpm.io/installation> using an offline mirror.
3. **Docker** (optional) for the all-in-one `docker-compose` workflow.

## Quick start

```bash
# install dependencies
pnpm install

# create/update the Prisma client and seed game content
pnpm --filter @rogue/server db:migrate
pnpm --filter @rogue/server db:seed

# run the API and client with hot reload in two terminals
pnpm --filter @rogue/server dev
pnpm --filter @rogue/client dev
```

Open <http://localhost:5173> to play the demo. The client expects the API at <http://localhost:3000> by default. Use
`docker-compose up --build` if you prefer Docker to manage Postgres, the API, and the client bundle automatically.

## Everyday commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run every package that exposes a `dev` script through Turborepo. |
| `pnpm lint` | Lint all source files. |
| `pnpm test` | Execute all package-level test suites. |
| `pnpm --filter @rogue/client test:e2e` | Playwright smoke test (requires the dev servers). |

### Working without pnpm

If you only need to exercise the shared gameplay package (for example in constrained CI environments), you can run its tests
with npm:

```bash
cd packages/shared
npx vitest run
```

This repository already contains the dependencies required by `packages/shared`, so the command above runs offline.

## Deployment checklist

- Build images from `apps/client/Dockerfile` and `apps/server/Dockerfile` or trigger the Turborepo build pipeline with
  `pnpm build`.
- Set production secrets for the API: `DATABASE_URL`, `JWT_SECRET`, and `COOKIE_SECRET`.
- Configure the client with `VITE_API_URL` so it knows where to find the server.

## Need help?

- Prisma schema changes require `pnpm --filter @rogue/server prisma generate`.
- Stale Turborepo cache? Delete the `.turbo` directory.
- Package manager download blocked by a proxy? Install pnpm manually and re-run `pnpm install`.

Happy hacking! Explore the ECS, content definitions, and math helpers in `packages/shared/src` to tweak mechanics quickly.
