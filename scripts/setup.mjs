#!/usr/bin/env node

/**
 * Quickstart script for the boilers monorepo.
 * Run: node scripts/setup.mjs
 *
 * Checks prerequisites, installs deps, fetches secrets from Vault,
 * boots Docker compose, runs migrations, and prints a summary.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const CHECK = "\u2705";
const WARN = "\u26a0\ufe0f";
const ERR = "\u274c";

function log(label, msg) {
  console.log(`${label} ${msg}${RESET}`);
}
function info(msg) { log(`${CYAN}ℹ${RESET}`, msg); }
function ok(msg) { log(`${GREEN}${CHECK}${RESET}`, msg); }
function warn(msg) { log(`${YELLOW}${WARN}${RESET}`, msg); }
function fail(msg) { log(`${RED}${ERR}${RESET}`, msg); process.exit(1); }

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf-8", ...opts }).trim();
  } catch (e) {
    if (opts.ignoreError) return "";
    throw e;
  }
}

function checkCommand(name, versionFlag = "--version", minVersion = null) {
  try {
    const out = run(`${name} ${versionFlag}`, { ignoreError: true });
    if (!out) return false;
    if (minVersion) {
      const ver = out.replace(/[^0-9.]/g, "");
      const parts = ver.split(".").map(Number);
      const minParts = minVersion.split(".").map(Number);
      for (let i = 0; i < Math.max(parts.length, minParts.length); i++) {
        const p = parts[i] || 0;
        const m = minParts[i] || 0;
        if (p > m) break;
        if (p < m) return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

// ── Prerequisites ──────────────────────────────────────────────────────────

console.log(`\n${BOLD}${CYAN}═══ boilers quickstart ═══${RESET}\n`);

info("Checking prerequisites...");

const nodeOk = checkCommand("node", "--version", "20.0.0");
if (!nodeOk) fail("Node.js >= 20 is required. Install from https://nodejs.org");

const pnpmOk = checkCommand("pnpm", "--version", "9.0.0");
if (!pnpmOk) fail("pnpm >= 9 is required. Install: npm install -g pnpm");

const dockerOk = checkCommand("docker", "--version");
const composeOk = checkCommand("docker", "compose version");
if (!dockerOk) warn("Docker not found. The stack needs Docker for infrastructure services.");
if (!composeOk) warn("Docker Compose not found. Install Docker Desktop or docker-compose-plugin.");

ok(`Node ${run("node --version")}`);
ok(`pnpm ${run("pnpm --version")}`);
if (dockerOk) ok(`Docker ${run("docker --version").replace("Docker version ", "")}`);

// ── Install dependencies ───────────────────────────────────────────────────

console.log(`\n${BOLD}Installing dependencies...${RESET}`);
run("pnpm install", { cwd: ROOT, stdio: "inherit" });
ok("Dependencies installed");

// ── Fetch secrets from Vault ────────────────────────────────────────────────

console.log(`\n${BOLD}Fetching secrets from Vault...${RESET}`);

if (dockerOk && composeOk) {
  try {
    run("docker compose run --rm vault-init", { cwd: ROOT, stdio: "inherit" });
    ok("Secrets fetched from Vault → .vault-envs/");
  } catch {
    warn("vault-init failed. Check VAULT_TOKEN in .env and Vault connectivity.");
    info("Secrets can also be placed manually in .vault-envs/*.env files.");
  }
} else {
  warn("Docker not available — skipping vault-init.");
  info("Place secrets manually: one file per service in .vault-envs/<service>.env");
}

// Ensure logs directories exist
for (const dir of ["logs/back", "logs/front"]) {
  const full = resolve(ROOT, dir);
  if (!existsSync(full)) {
    mkdirSync(full, { recursive: true });
    ok(`Created ${dir}/`);
  }
}

// Check VAPID keys in vault frontend env
const frontendEnv = resolve(ROOT, ".vault-envs/frontend.env");
if (existsSync(frontendEnv)) {
  const vapidCheck = run(`grep -c "VAPID_PUBLIC_KEY=" "${frontendEnv}" 2>/dev/null || true`, { ignoreError: true });
  if (!vapidCheck || vapidCheck === "0") {
    warn("VAPID_PUBLIC_KEY not set in vault frontend secrets. Add it via Vault UI.");
    info("Web Push features will be disabled until keys are configured.");
  } else {
    ok("VAPID keys are configured");
  }
} else {
  warn("frontend.env not found — VAPID keys not checked");
}

// ── Docker compose ─────────────────────────────────────────────────────────

if (dockerOk && composeOk) {
  console.log(`\n${BOLD}Starting Docker stack (core profile)...${RESET}`);
  info("This may take a few minutes on first run (building images).");

  try {
    run("docker compose --profile core up -d --build migrate", { cwd: ROOT, stdio: "inherit" });
    ok("Docker stack is running (core services: postgres, redis, app, nextjs, ELK, MinIO)");
  } catch (e) {
    warn(`Docker stack failed to start: ${e.message}`);
    info("Check docker-compose.yml and .vault-envs/*.env files for configuration issues.");
    info("Ensure vault-init ran: docker compose run --rm vault-init");
    info("Known footgun: logs/ directories must be writable by uid 1000.");
    info("Fix: chmod 777 logs/back logs/front");
  }
} else {
  warn("Skipping Docker setup. Start infra services manually:");
  info("  docker compose --profile core up -d");
}

// ── Prisma migrations ──────────────────────────────────────────────────────

console.log(`\n${BOLD}Running database migrations...${RESET}`);
try {
  const dbRunning = run(
    "docker compose exec -T postgres pg_isready -U nest 2>/dev/null && echo ok || echo no",
    { cwd: ROOT, ignoreError: true }
  );

  if (dbRunning.includes("ok")) {
    run("pnpm --filter nest-js-boilerplate exec prisma migrate deploy", {
      cwd: ROOT,
      stdio: "inherit",
    });
    ok("Prisma migrations applied");
  } else {
    warn("Postgres is not running. Run later: pnpm --filter nest-js-boilerplate exec prisma migrate deploy");
    warn("  Or: docker compose exec migrate true  # triggers the one-shot container");
  }
} catch (e) {
  warn(`Migration failed: ${e.message}`);
  info("Run manually later: pnpm --filter nest-js-boilerplate exec prisma migrate deploy");
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log(`\n${BOLD}${GREEN}═══ Setup complete ═══${RESET}\n`);
console.log(`  ${CYAN}Frontend${RESET}    http://localhost:3100`);
console.log(`  ${CYAN}Backend${RESET}     http://localhost:3000`);
console.log(`  ${CYAN}API (Swagger)${RESET}  http://localhost:3000/api`);
console.log(`  ${CYAN}GraphQL${RESET}     http://localhost:3000/graphql`);
console.log(`  ${CYAN}Mailpit${RESET}     http://localhost:8025  (profile: mail)`);
console.log(`  ${CYAN}MinIO${RESET}      http://localhost:9001  (minioadmin / minioadmin)`);
console.log(`  ${CYAN}Kibana${RESET}     http://localhost:5601`);
console.log(`  ${CYAN}Redis Commander${RESET}  http://localhost:8081  (profile: tools)`);
console.log(`\n  ${BOLD}Commands:${RESET}`);
console.log(`    pnpm dev        — start both apps with hot reload`);
console.log(`    pnpm build      — build both apps`);
console.log(`    pnpm test       — run all tests`);
console.log(`    pnpm lint       — lint everything`);
console.log(`    pnpm docker:up  — start full stack with all profiles`);
console.log(`    pnpm docker:down  — stop stack`);
console.log(`\n  ${YELLOW}Next steps:${RESET}`);
console.log(`    1. Open http://localhost:3100`);
console.log(`    2. Register a new account`);
console.log(`    3. Explore the app`);
console.log(`\n`);
