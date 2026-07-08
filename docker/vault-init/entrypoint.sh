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
  echo "vault-init: fetching $svc secrets..."

  outfile="/secrets/$svc.env"

  curl -sf -H "X-Vault-Token: $VAULT_TOKEN" \
    "$VAULT_ADDR/v1/secret/data/production/$svc" \
    | jq -r '.data.data | to_entries | .[] | "\(.key)=\(.value)"' \
    > "$outfile"

  count=$(wc -l < "$outfile")
  echo "vault-init: wrote $outfile ($count vars)"
done

echo "vault-init: all secrets fetched"
