FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Install all workspace deps ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────────────
FROM deps AS builder
# NEXT_PUBLIC_* vars are baked into the bundle at build time
ARG NEXT_PUBLIC_BACKEND_URL=https://api.drafts-io.com
ARG NEXT_PUBLIC_VERCEL_ENV=production
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_VERCEL_ENV=$NEXT_PUBLIC_VERCEL_ENV

COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
RUN pnpm --filter frontend build

# ── Runner ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# next.config.ts sets outputFileTracingRoot to the monorepo root, so the
# standalone directory mirrors the monorepo structure from the root.
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
CMD ["node", "apps/frontend/server.js"]
