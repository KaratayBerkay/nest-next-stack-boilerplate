#!/bin/sh
set -e

VAULT_ENVS=".vault-envs"
FRONTEND_ENV="$VAULT_ENVS/frontend.env"

# Ensure vault files exist
if [ ! -f "$FRONTEND_ENV" ]; then
  echo "vault-envs missing — running vault-init..."
  docker compose run --rm vault-init
fi

# Export vault frontend vars so docker-compose interpolates build args
set -a
. "$FRONTEND_ENV"
set +a

exec docker compose up --build "$@"
