FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Install all workspace deps ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build
# Create a self-contained production directory (resolves workspace deps)
RUN pnpm deploy --filter backend --prod /deploy --ignore-scripts

# ── Runner ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /deploy .
COPY --from=builder /app/apps/backend/prisma ./prisma

# Generate Prisma client (schema is now at ./prisma/schema.prisma)
RUN npx --yes prisma generate

EXPOSE 3001

# Run migrations then start — DB must be reachable (ensured by healthcheck in compose)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]
