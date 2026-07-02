# Kubernetes manifests

Reference manifests for running the boilerplate in k8s. They're intentionally plain YAML (no
Helm/Kustomize) so they read as documentation; adapt namespaces, hostnames, and an Ingress to
your cluster. See [`../../docs/backend/research/build-and-docker.md`](../../docs/backend/research/build-and-docker.md)
for the reasoning behind every setting.

## Files
| File | What |
| --- | --- |
| `configmap.yaml` | non-secret env (ports, datastore hosts, log level, Node tuning) |
| `secret.example.yaml` | **example** secret (DATABASE_URL, JWT/cookie/CSRF secrets, API keys) — never commit real values |
| `migrate-job.yaml` | one-shot `prisma migrate deploy` Job (uses the `migrate` image target) |
| `deployment.yaml` | the app: probes, graceful shutdown, resources, hardened securityContext |
| `service.yaml` | ClusterIP exposing http (80→3000) + grpc (5050) |

## Images
```bash
# App image (default last stage)
docker build -f Dockerfile.prod -t <repo>/nest-boilerplate:<git-sha> .
# Migration image (keeps the prisma CLI)
docker build -f Dockerfile.prod --target migrate -t <repo>/nest-boilerplate-migrate:<git-sha> .
```
Pin Deployments/Jobs to the immutable `<git-sha>` tag (or digest), not `:prod`/`:latest`.

## Apply order
```bash
kubectl apply -f configmap.yaml
kubectl apply -f secret.example.yaml        # after editing, or create the secret from your manager
kubectl apply -f migrate-job.yaml
kubectl wait --for=condition=complete job/nest-boilerplate-migrate --timeout=300s
kubectl apply -f deployment.yaml -f service.yaml
```
Run the migration Job (and wait for it) **before** rolling out the Deployment — the app image has
no prisma CLI, and running migrations per-replica would race.

## Not included (cluster-specific)
Ingress/Gateway + TLS, HorizontalPodAutoscaler, PodDisruptionBudget, NetworkPolicy, and the
Postgres/Redis/broker backing services (point the ConfigMap/Secret at your managed instances).
