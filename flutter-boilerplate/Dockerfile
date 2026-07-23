FROM ghcr.io/cirruslabs/flutter:3.27.0 AS base
RUN flutter config --no-analytics && dart --disable-analytics

FROM base AS deps
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN dart pub get

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/.dart_tool ./.dart_tool
COPY --from=deps /app/.packages ./
COPY . .
ARG APP_ENV=production
ENV APP_ENV=$APP_ENV
RUN flutter build apk --release --dart-define=APP_ENV=$APP_ENV

FROM scratch AS artifact
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk /app-release.apk
