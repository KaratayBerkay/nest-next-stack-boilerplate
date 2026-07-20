# Thin convenience wrapper around `docker compose` with PROFILE=/SERVICE=
# shortcuts. `make up` and `make rebuild` automatically run vault-init first.
#
# Usage: make up | make build | make rebuild | make down | make logs | make ps
# Add a profile: make up PROFILE=all
# Target one service: make rebuild SERVICE=nextjs

PROFILE ?=
SERVICE ?=
PROFILE_FLAG := $(if $(PROFILE),--profile $(PROFILE),)
COMPOSE := docker compose $(PROFILE_FLAG)

.PHONY: up down build rebuild restart logs ps vault

vault: ## Fetch secrets from Vault
	$(COMPOSE) run --rm vault-init

up: vault ## Start the stack (build + run)
	$(COMPOSE) up -d --build $(SERVICE)

down: ## Stop the stack
	$(COMPOSE) down

build: ## Build images (or one: make build SERVICE=nextjs)
	$(COMPOSE) build $(SERVICE)

rebuild: vault ## Rebuild images and recreate containers (or one: make rebuild SERVICE=nextjs)
	$(COMPOSE) up -d --build $(SERVICE)

restart: ## Recreate containers without rebuilding (or one: make restart SERVICE=app)
	$(COMPOSE) up -d --force-recreate $(SERVICE)

logs: ## Follow logs
	$(COMPOSE) logs -f

ps: ## Show container status
	$(COMPOSE) ps
