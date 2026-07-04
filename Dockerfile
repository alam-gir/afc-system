# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv

ARG NODE_VERSION=22-alpine

# ---- base: shared setup for pnpm across stages ----
FROM node:${NODE_VERSION} AS base
# Works around a libuv io_uring bug that hangs Node under QEMU emulation
# (e.g. building --platform linux/amd64 on Apple Silicon): https://github.com/nodejs/node/issues/48444
ENV UV_USE_IO_URING=0
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

# ---- deps: install all dependencies (needed to build) ----
FROM base AS deps
# argon2 ships a prebuilt musl binary that node-gyp-build resolves directly,
# so no native build toolchain (python3/make/g++) is needed here.
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---- builder: build the Next.js app in standalone mode ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy build-time values only, real values are injected at runtime (see docker-compose.yml).
# Next.js does not need real secrets to build since nothing here is a NEXT_PUBLIC_* var.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db" \
    AUTH_SECRET="build-time-placeholder"
RUN pnpm build

# ---- prod-deps: production-only node_modules for scripts/migrate.mjs ----
# Next's standalone trace only bundles what the Next.js server itself imports,
# not this separately-run migration script, so it needs its own node_modules.
FROM base AS prod-deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# ---- runner: minimal production image ----
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
