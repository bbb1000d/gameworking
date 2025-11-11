# Rogue Tier v2

Rogue Tier v2 is a web-based top-down action shooter prototype built around a full-stack TypeScript monorepo. The project ships a
React + PixiJS client, Fastify API with Prisma/PostgreSQL, and a shared gameplay package that exposes the ECS, content data, and
math helpers used across both runtime targets.

## Repository structure

```
.
├── apps
│   ├── client      # Vite + React front-end with PixiJS renderer, Zustand state, React Query data layer
│   └── server      # Fastify API with JWT cookie auth, Prisma ORM, content seed scripts, Jest tests
├── packages
│   └── shared      # Strongly-typed shared contracts, ECS core, math helpers, and data-driven content definitions
├── docker-compose.yml # Launches Postgres + API + client bundles in development containers
└── README.md
```

## Quick start (beginner friendly)

These steps assume Docker Desktop (or another container engine) and Node.js 18+ are already installed. Every command is intended
to be copy/pasted.

1. **Install pnpm**
   ```bash
   npm install -g pnpm
   ```
2. **Install workspace dependencies**
   ```bash
   pnpm install
   ```
3. **Generate the Prisma client & seed content**
   ```bash
   pnpm --filter @rogue/server db:migrate
   pnpm --filter @rogue/server db:seed
   ```
4. **Launch local services**
   - Start Postgres + API + client in Docker:
     ```bash
     docker-compose up --build
     ```
   - Or run the apps individually with hot reload:
     ```bash
     pnpm --filter @rogue/server dev
     pnpm --filter @rogue/client dev
     ```
5. **Open the game** – visit http://localhost:5173 to play the top-down shooter demo.

### Useful scripts

| Command | Description |
| --- | --- |
| `pnpm --filter @rogue/client test` | Run Vitest unit tests for the client (store + systems). |
| `pnpm --filter @rogue/client test:e2e` | Execute Playwright smoke scenario (requires dev servers running). |
| `pnpm --filter @rogue/server test` | Run Jest tests for Fastify routes (prisma is mocked in tests). |
| `pnpm --filter @rogue/shared test` | Run Vitest suite for ECS + math utilities. |
| `pnpm lint` | Invoke ESLint across all packages. |

## Gameplay feature highlights

- **Advanced movement** – WASD, pointer aiming, stamina management, and projectile collision courtesy of the shared ECS package.
- **Combat loop** – deterministic fixed-step simulation with enemy pursuit, projectile impacts, and stamina drain/regen.
- **Skill tree** – 24-node branching graph exported from `packages/shared`, grouped by Offense/Control/Survivability/Utility with
  gate nodes requiring boss unlock sigils.
- **Boss + dungeon data** – shared content definitions keep unlock keys and tier data consistent between client and server.
- **Authoritative backend** – Fastify server handles auth, characters, skill allocation validation, run lifecycle, and unlocks.

## Deployment notes

- `apps/client/Dockerfile` builds the static PixiJS bundle into an NGINX image.
- `apps/server/Dockerfile` packages the Fastify API with Prisma migrations ready to run against Postgres.
- `docker-compose.yml` wires together Postgres, API, and client for local integration.
- Set the `DATABASE_URL`, `JWT_SECRET`, and `COOKIE_SECRET` environment variables in production. The client expects
  `VITE_API_URL` to point at the API base URL.

## Troubleshooting

- If `pnpm install` fails with registry authentication errors, configure npm access (`npm login`) or provide an alternate
  registry mirror before retrying.
- Regenerate Prisma client after schema changes: `pnpm --filter @rogue/server prisma generate`.
- Delete the `.turbo` directory if turbo cache becomes out of sync.

Enjoy experimenting with the Rogue Tier sandbox and extend content via the JSON-driven definitions in `packages/shared/content`.
