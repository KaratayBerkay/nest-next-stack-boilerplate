#!/bin/sh
# Applies the structured-logs index template to Elasticsearch. Idempotent —
# safe (and cheap) to run on every stack startup, not just the first.
#
# Why this has to run before fluent-bit ever ships a line: composable index
# templates only affect indices created AFTER the template exists — they
# never retroactively fix one that's already there. Elasticsearch has no
# fixed schema of its own; the first document to introduce a given field
# name decides that field's type for the index's entire lifetime (dynamic
# mapping), and that choice can't be changed without deleting the index. If
# fluent-bit gets to write the first line before this template lands (e.g.
# right after a `docker compose down -v` recreates the Elasticsearch volume),
# whichever type that first line's `time` field happens to be — a number or
# a string — wins by chance, and every subsequent line using the other shape
# is then permanently rejected until someone notices and deletes the index.
# That's exactly what happened on 2026-08-18: a stray numeric `time` value
# landed first, locked the field to `long`, and every real Pino log line
# after it — `time` is always an ISO string — was rejected outright, backing
# fluent-bit into an infinite retry loop for every chunk (Retry_Limit False
# never gives up on a poisoned chunk). Applying this template first removes
# the coin flip: `time`/`@timestamp` are pinned to `date` before any index
# matching the pattern is ever created, on every startup, not just the
# first one.
set -eu

curl -fsS -X PUT "http://elasticsearch:9200/_index_template/structured-logs" \
  -H "Content-Type: application/json" \
  --data-binary @/templates/index-template-structured-logs.json

echo "Elasticsearch structured-logs index template applied."
