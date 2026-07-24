FROM ghcr.io/cirruslabs/flutter:3.44.2 AS base
RUN flutter config --no-analytics && dart --disable-analytics

FROM base AS deps
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/.dart_tool ./.dart_tool
COPY . .
ARG APP_ENV=production
ENV APP_ENV=$APP_ENV
RUN flutter build apk --release --dart-define-from-file=.env.example

FROM python:3.12-alpine AS serve
WORKDIR /srv
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk .
RUN printf '<html><body><h1>Flutter APK</h1><a href="app-release.apk">Download</a></body></html>' > index.html
EXPOSE 8082
CMD ["python3", "-m", "http.server", "8082"]

FROM scratch AS artifact
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk /app-release.apk