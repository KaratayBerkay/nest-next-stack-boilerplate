FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && pnpm --version
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm fetch --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /root/.cache/node/corepack /root/.cache/node/corepack
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_REALTIME_WS_URL
ARG NEXT_PUBLIC_MINIO_PUBLIC_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_REALTIME_WS_URL=$NEXT_PUBLIC_REALTIME_WS_URL
ENV NEXT_PUBLIC_MINIO_PUBLIC_URL=$NEXT_PUBLIC_MINIO_PUBLIC_URL
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm config set store-dir /pnpm/store && \
    pnpm generate-i18n-types && \
    pnpm exec next build

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
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3100}/ || exit 1
CMD ["node", "server.js"]
