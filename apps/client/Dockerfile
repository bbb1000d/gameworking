FROM node:20-slim AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/client/package.json apps/client/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install -g pnpm \
  && pnpm install --filter @rogue/client...

FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm \
  && pnpm --filter @rogue/shared build \
  && pnpm --filter @rogue/client build

FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
