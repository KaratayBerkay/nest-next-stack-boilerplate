# Thin convenience wrapper around `docker compose` with PROFILE=/SERVICE=
# shortcuts. Before the first build, run vault-init to populate secrets:
#   docker compose run --rm vault-init
#
# Usage: make up | make build | make rebuild | make down | make logs | make ps
# Add a profile: make up PROFILE=all
# Target one service: make rebuild SERVICE=nextjs

PROFILE ?=
SERVICE ?=
PROFILE_FLAG := $(if $(PROFILE),--profile $(PROFILE),)
COMPOSE := docker compose $(PROFILE_FLAG)

.PHONY: up down build rebuild restart logs ps

up: ## Start the stack (remember to run vault-init first)
	$(COMPOSE) up -d $(SERVICE)

down: ## Stop the stack
	$(COMPOSE) down

build: ## Build images (or one: make build SERVICE=nextjs)
	$(COMPOSE) build $(SERVICE)

rebuild: ## Rebuild images and recreate containers (or one: make rebuild SERVICE=nextjs)
	$(COMPOSE) up -d --build $(SERVICE)

restart: ## Recreate containers without rebuilding (or one: make restart SERVICE=app)
	$(COMPOSE) up -d --force-recreate $(SERVICE)

logs: ## Follow logs
	$(COMPOSE) logs -f

ps: ## Show container status
	$(COMPOSE) ps
