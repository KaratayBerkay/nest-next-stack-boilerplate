# Thin convenience wrapper around `docker compose` — mainly for the
# PROFILE=/SERVICE= shortcuts and `make setup`. No --env-file is needed here
# (or for any raw `docker compose` command): the frontend build copies
# prod/nextjs.env in directly rather than taking it as --build-arg, so there
# is no Compose-level ${VAR} interpolation left anywhere in this project.
#
# Usage: make up | make build | make rebuild | make down | make logs | make ps
# Add a profile: make up PROFILE=all
# Target one service: make rebuild SERVICE=nextjs

PROFILE ?=
SERVICE ?=
PROFILE_FLAG := $(if $(PROFILE),--profile $(PROFILE),)
COMPOSE := docker compose $(PROFILE_FLAG)

.PHONY: setup up down build rebuild restart logs ps

setup: ## Copy every *.env.example to its real name + symlink prod/nextjs.env for local `pnpm dev` (first run only; won't overwrite existing files)
	test -f prod/app.env || cp prod/app.env.example prod/app.env
	test -f prod/nextjs.env || cp prod/nextjs.env.example prod/nextjs.env
	for f in prod/services/*.env.example; do t="$${f%.example}"; test -f "$$t" || cp "$$f" "$$t"; done
	ln -sf ../prod/nextjs.env next-js-boilerplate/.env.local

up: ## Start the stack (or one service: make up SERVICE=app)
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
