# 04 — DevOps & infrastructure

The root compose stack runs healthy as of 2026-07-02 (14 services + 2 one-shots), but
several choices are dev-grade and the deploy story is backend-only.

## P1 — Compose hardening (S/M)

- [ ] **Healthchecks for the rest**: `kafka` (`kafka-broker-api-versions.sh`), `mongo`
      (`mongosh --eval 'db.adminCommand("ping")'`), `nats` (`wget :8222/healthz`),
      `mqtt`, `kibana`, `fluent-bit` — today only postgres/redis/rabbitmq/minio/ES/app
      are probed, so `depends_on` ordering is partly cosmetic.
- [ ] **Pin `minio` image** — `quay.io/minio/minio:latest` is the only unpinned tag in
      the file (`mc` already bit us: its `config host add` removal broke
      `minio-setup`).
- [ ] **`app` should wait for kafka** when the kafka profile is active (the consumer
      currently races a fresh broker; see 02).
- [ ] **Logs bind-mount ownership**: `./nest-js-boilerplate/logs` must be uid 1000 or
      the app crash-loops with `EACCES` on `logs/app.log` — Docker creates it as root
      on first run. Either document `mkdir -p nest-js-boilerplate/logs` as a setup
      step, switch to a named volume (losing easy host tailing), or have fluent-bit
      consume only the forward input and drop the file sink in Docker.
- [ ] **Resource limits** for the heavy services (ES already has heap opts; kafka,
      kibana, mongo have nothing) so the full `--profile all` stack has a predictable
      footprint.
- [ ] **Log rotation** for the fluentd driver and the file sink (`max-size`/`max-file`
      on json-file services; pino file sink grows unbounded).

## P1 — Frontend deploy parity (M)

`nest-js-boilerplate/k8s/` has deployment/service/configmap/secret/migrate-job for the
backend; the frontend has **no k8s manifests at all**.

- [ ] `k8s/` for the frontend (deployment + service + configmap for the
      `NEXT_PUBLIC_*`/BFF env, standalone image, readiness on `/`).
- [ ] Reuse the backend's `migrate-job.yaml` pattern in docs: compose now has the same
      concept as the `migrate` one-shot service (added 2026-07-02).
- [ ] Consider kustomize overlays (dev/prod) before the manifest count grows.

## P1 — Image publishing & supply chain (M)

- [ ] CI job pushing both prod images to GHCR on tag (multi-arch if Apple Silicon dev
      machines matter).
- [ ] Vulnerability scan (trivy/grype) + SBOM in the same job.
- [ ] `docker compose` should then support pulling published images
      (`image:` + `build:` both set) so users can skip the 5-minute build.

## P2 — Data lifecycle

- [ ] **Postgres backups** — a `pg_dump` cron sidecar (or documented `docker exec`
      one-liner) + restore runbook; volumes are currently the only copy.
- [ ] **Elasticsearch ILM** — `frontend-logs` index grows forever; add a lifecycle
      policy (7–30 day retention) and a saved Kibana data view so the ELK profile is
      useful out of the box.
- [ ] **MinIO bucket versioning/retention** — `uploads` bucket is created with
      anonymous download; document that this is demo-grade and add a locked-down
      variant for prod.

## P2 — Secrets & config

- [ ] Move dev-default secrets (`JWT_SECRET`, `ENCRYPTION_KEY`, `nest`/`nest`,
      `minioadmin`) behind a documented `.env` (see 01's root `.env.example`) and add
      a startup warning in the backend when running with known dev defaults in
      `NODE_ENV=production`.
- [ ] Evaluate SOPS or docker secrets for the compose prod story; k8s side already has
      `secret.example.yaml`.
