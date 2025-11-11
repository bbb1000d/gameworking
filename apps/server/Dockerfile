FROM node:20-slim AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install -g pnpm \
  && pnpm install --filter @rogue/server...

FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm \
  && pnpm --filter @rogue/shared build \
  && pnpm --filter @rogue/server build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
RUN npm install -g pnpm \
  && pnpm install --prod --filter @rogue/server...
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]
