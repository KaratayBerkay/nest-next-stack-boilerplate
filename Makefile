# Thin convenience wrapper around `docker compose` with PROFILE=/SERVICE=
# shortcuts. `make up` and `make rebuild` automatically run vault-init first.
#
# Usage: make up | make build | make rebuild | make deploy | make down | make logs | make ps | make clean
# Add a profile: make up PROFILE=all
# Target one service: make rebuild SERVICE=nextjs

PROFILE ?=
SERVICE ?=
PROFILE_FLAG := $(if $(PROFILE),--profile $(PROFILE),)
COMPOSE := docker compose $(PROFILE_FLAG)

.PHONY: up down build rebuild restart logs ps vault clean deploy

vault: ## Fetch secrets from Vault
	$(COMPOSE) run --rm vault-init

up: vault ## Start the stack (build + run), auto-remove one-shot containers
	$(COMPOSE) up -d --build $(SERVICE)
	$(COMPOSE) wait migrate minio-setup 2>/dev/null || true
	$(COMPOSE) rm -f migrate minio-setup 2>/dev/null || true

down: ## Stop the stack
	$(COMPOSE) down

build: ## Build images (or one: make build SERVICE=nextjs)
	$(COMPOSE) build $(SERVICE)

rebuild: vault ## Rebuild images and recreate containers, auto-remove one-shot containers
	$(COMPOSE) up -d --build $(SERVICE)
	$(COMPOSE) wait migrate minio-setup 2>/dev/null || true
	$(COMPOSE) rm -f migrate minio-setup 2>/dev/null || true

restart: ## Recreate containers without rebuilding (or one: make restart SERVICE=app)
	$(COMPOSE) up -d --force-recreate $(SERVICE)

deploy: ## Pull latest, fetch secrets, rebuild and restart
	git pull
	$(COMPOSE) run --rm vault-init
	$(COMPOSE) up -d --build $(SERVICE)
	$(COMPOSE) wait migrate minio-setup 2>/dev/null || true
	$(COMPOSE) rm -f migrate minio-setup 2>/dev/null || true

clean: ## Remove stopped one-shot containers (migrate, vault-init, minio-setup)
	$(COMPOSE) rm -f -s migrate vault-init minio-setup

logs: ## Follow logs
	$(COMPOSE) logs -f

ps: ## Show container status
	$(COMPOSE) ps
