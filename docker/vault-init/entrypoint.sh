#!/bin/sh
set -e

apk add --no-cache curl jq >/dev/null 2>&1

SERVICES="
  backend
  elasticsearch
  frontend
  kafka
  kibana
  minio
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
    rm -f /tmp/vault_response.json
    continue
  fi

  jq -r '.data.data | to_entries | .[] | "\(.key)=\(.value)"' \
    /tmp/vault_response.json > "$outfile"

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

echo "vault-init: done"
