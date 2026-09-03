# 3.44.0 is the final tag cirruslabs published (registry frozen May 2026);
# 3.44.2 was never pushed. instrumentisto/flutter is the maintained
# alternative but tops out at 3.41.x as of 2026-08.
FROM ghcr.io/cirruslabs/flutter:3.44.0 AS base
RUN flutter config --no-analytics && dart --disable-analytics

FROM base AS deps
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/.dart_tool ./.dart_tool
COPY . .
# The release APK takes its config from a dart-define file (README §
# Environment Variables). This used to build from `.env.example`, whose
# APP_ENV=development switched on Dio's request/response logging — auth
# headers and token-bearing bodies printed to logcat — inside a *release*
# binary, and pointed it at localhost (MOB-041). Build from a real env file
# and refuse anything that isn't a production config; pick another file with
# `docker build --build-arg ENV_FILE=.env.staging`.
ARG ENV_FILE=.env
RUN test -f "$ENV_FILE" || { \
      echo "ERROR: $ENV_FILE not found — copy .env.example to $ENV_FILE with production values (see README)"; \
      exit 1; \
    }
RUN grep -Eq '^APP_ENV=production[[:space:]]*$' "$ENV_FILE" || { \
      echo "ERROR: refusing to build a release APK: $ENV_FILE must set APP_ENV=production"; \
      exit 1; \
    }
# No android/key.properties in the build context means this APK is signed
# with the debug keystore — Gradle now says so loudly (MOB-047). It is fine
# for the tester download page below, never for store distribution.
RUN flutter build apk --release --dart-define-from-file="$ENV_FILE"

FROM python:3.13-alpine AS serve
WORKDIR /srv
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk .
RUN printf '<html><body><h1>Flutter APK</h1><a href="app-release.apk">Download</a></body></html>' > index.html
EXPOSE 8082
CMD ["python3", "-m", "http.server", "8082"]

FROM scratch AS artifact
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk /app-release.apk
