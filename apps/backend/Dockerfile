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
COPY apps/backend/prisma ./apps/backend/prisma
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build
# Generate Prisma client while devDeps (prisma CLI) are still available
RUN pnpm --filter backend exec prisma generate
# Create a self-contained production directory (resolves workspace deps)
RUN pnpm deploy --filter backend --prod /deploy --legacy --ignore-scripts
# Copy the generated Prisma client into the deploy — pnpm deploy copies from
# the store (ungenerated), so we need to bring the generated files manually
RUN cp -r node_modules/.prisma /deploy/node_modules/.prisma

# ── Runner ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /deploy .
COPY --from=builder /app/apps/backend/prisma ./prisma

EXPOSE 3001

# Run migrations then start — DB must be reachable (ensured by healthcheck in compose)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]
