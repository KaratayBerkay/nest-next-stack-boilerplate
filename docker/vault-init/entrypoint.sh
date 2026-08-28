#!/bin/sh
set -e

apk add --no-cache curl jq >/dev/null 2>&1

SERVICES="
  backend
  elasticsearch
  frontend
  kafka
  kibana
  mobile
  mongo
  postgres
  rabbitmq
  redis-commander
"

for svc in $SERVICES; do
  outfile="/secrets/$svc.env"
  echo "vault-init: fetching $svc secrets..."

  http_code=$(curl -s -o /tmp/vault_response.json -w "%{http_code}" \
    -H "X-Vault-Token: $VAULT_TOKEN" \
    "$VAULT_ADDR/v1/secret/data/secret/production/$svc")

  if [ "$http_code" != "200" ]; then
    echo "vault-init: $svc returned HTTP $http_code — writing empty file"
    : > "$outfile"
  else
    jq -r '.data.data | to_entries | .[] | "\(.key)=\(.value)"' \
      /tmp/vault_response.json > "$outfile"
  fi

  # Local, non-Vault overrides: <svc>.env.local is appended after the Vault
  # values so its keys win (docker env_file: the last occurrence of a key is
  # the one that counts). For secrets this deploy box's read-only Vault token
  # cannot write upstream — move them into Vault when a privileged token is
  # at hand and delete the .local line.
  if [ -f "/secrets/$svc.env.local" ]; then
    cat "/secrets/$svc.env.local" >> "$outfile"
    echo "vault-init: appended $svc.env.local overrides"
  fi

  count=$(wc -l < "$outfile")
  echo "vault-init: wrote $outfile ($count vars)"
  rm -f /tmp/vault_response.json
done

# Merge NEXT_PUBLIC_* from frontend vault into project .env for compose build
if [ -f /secrets/frontend.env ]; then
  project_env="/project/.env"
  build_vars=$(grep '^NEXT_PUBLIC_' /secrets/frontend.env || true)
  if [ -n "$build_vars" ]; then
    if [ -f "$project_env" ]; then
      # Strip stale NEXT_PUBLIC_* lines
      grep -v '^NEXT_PUBLIC_' "$project_env" > /tmp/clean.env || true
      cp /tmp/clean.env "$project_env"
    fi
    echo "$build_vars" >> "$project_env"
    echo "vault-init: $(echo "$build_vars" | wc -l) NEXT_PUBLIC_* vars merged into .env"
  fi
fi

# Copy full mobile.env to flutter-boilerplate/.env for Flutter builds
cp /secrets/mobile.env /project/flutter-boilerplate/.env
echo "vault-init: copied mobile.env → flutter-boilerplate/.env"

# Fix ownership to host user (default 1000 if HOST_UID not set)
chown -R "${HOST_UID:-1000}:${HOST_GID:-1000}" \
  /secrets /project/flutter-boilerplate/.env
echo "vault-init: chowned secrets and flutter .env to ${HOST_UID:-1000}:${HOST_GID:-1000}"

echo "vault-init: done"
