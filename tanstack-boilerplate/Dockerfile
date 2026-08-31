FROM node:24.20.0-alpine3.24 AS base
RUN apk update && apk upgrade --no-cache && apk add --no-cache tini
RUN corepack enable && pnpm --version

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm fetch --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY package.json ./
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_REALTIME_WS_URL
ARG NEXT_PUBLIC_LIVEKIT_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ARG NEXT_PUBLIC_IMAGE_HOSTNAMES
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_REALTIME_WS_URL=$NEXT_PUBLIC_REALTIME_WS_URL
ENV NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV NEXT_PUBLIC_IMAGE_HOSTNAMES=$NEXT_PUBLIC_IMAGE_HOSTNAMES
ENV CI=true

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile --prefer-offline && \
    pnpm generate-i18n-types && \
    pnpm exec vite build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Nitro's node-server entry reads PORT and HOST (not Next's HOSTNAME).
ENV PORT=3100
ENV HOST=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 tanstack
# Nitro output is self-contained: server bundle + client assets + node_modules.
COPY --from=builder --chown=tanstack:nodejs /app/.output ./.output
COPY --from=builder --chown=tanstack:nodejs /app/messages ./messages

USER tanstack
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3100}/ || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", ".output/server/index.mjs"]
