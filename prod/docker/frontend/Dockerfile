# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    corepack enable && \
    pnpm config set store-dir /pnpm/store && \
    pnpm fetch --frozen-lockfile

# ---- builder ----
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* is inlined into the client bundle at build time — pass the
# public origins as build args (see docker-compose.yml build.args). Defaults
# keep local no-args builds working.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3100
ARG NEXT_PUBLIC_REALTIME_WS_URL=ws://localhost:3000/ws
ARG NEXT_PUBLIC_MINIO_PUBLIC_URL=http://localhost:9000
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_REALTIME_WS_URL=$NEXT_PUBLIC_REALTIME_WS_URL \
    NEXT_PUBLIC_MINIO_PUBLIC_URL=$NEXT_PUBLIC_MINIO_PUBLIC_URL \
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY

# `pnpm build`'s `prebuild` hook also runs `fallow-check` (a git-diff-based lint
# gate), which needs a real git history/remote to detect its comparison base —
# absent in this build context. Run the actual prerequisite (i18n types) and
# `next build` directly instead, same reasoning as the backend Dockerfile's
# `pnpm exec nest build`.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm config set store-dir /pnpm/store && \
    pnpm generate-i18n-types && \
    pnpm exec next build

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3100

# 127.0.0.1, not localhost: busybox wget resolves localhost to ::1 first, but the
# standalone server binds IPv4 only.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3100}/ || exit 1

CMD ["node", "server.js"]
