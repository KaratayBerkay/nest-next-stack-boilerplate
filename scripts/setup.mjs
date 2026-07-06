#!/usr/bin/env node

/**
 * Quickstart script for the boilers monorepo.
 * Run: node scripts/setup.mjs
 *
 * Checks prerequisites, installs deps, copies env files, generates secrets,
 * boots Docker compose, runs migrations, and prints a summary.
 */

import { execSync } from "child_process";
import { existsSync, copyFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

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

function generateHex(length) {
  return crypto.randomBytes(length).toString("hex");
}

function ensureEnvFile(src, dest, generateSecrets = false) {
  if (existsSync(dest)) {
    ok(`${dest} already exists`);
    return;
  }
  copyFileSync(src, dest);
  ok(`Created ${dest} from ${src}`);

  if (generateSecrets) {
    let content = require("fs").readFileSync(dest, "utf-8");
    const replacements = {
      "dev-only-jwt-secret-change-me": generateHex(32),
      "change-me-dev-only-jwt-secret": generateHex(32),
      "change-me-dev-only-cookie-secret": generateHex(32),
      "change-me-dev-only-csrf-secret": generateHex(32),
      "0".repeat(64): generateHex(32),
    };
    for (const [placeholder, value] of Object.entries(replacements)) {
      if (content.includes(placeholder)) {
        content = content.replaceAll(placeholder, value);
        info(`Replaced ${placeholder} in ${dest}`);
      }
    }
    require("fs").writeFileSync(dest, content);
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

// ── Create env files ───────────────────────────────────────────────────────

console.log(`\n${BOLD}Setting up environment files...${RESET}`);

const envPairs = [
  ["prod/app.env.example", "prod/app.env"],
  ["prod/nextjs.env.example", "prod/nextjs.env"],
  ["prod/services/postgres.env.example", "prod/services/postgres.env"],
  ["prod/services/minio.env.example", "prod/services/minio.env"],
  ["prod/services/rabbitmq.env.example", "prod/services/rabbitmq.env"],
  ["prod/services/mongo.env.example", "prod/services/mongo.env"],
];

for (const [src, dest] of envPairs) {
  ensureEnvFile(resolve(ROOT, src), resolve(ROOT, dest), src === "prod/app.env.example");
}

// Symlink nextjs.env → .env.local for local pnpm dev
const localEnvLink = resolve(ROOT, "next-js-boilerplate", ".env.local");
if (!existsSync(localEnvLink)) {
  try {
    run(`ln -sf ../prod/nextjs.env ${localEnvLink}`);
    ok(`Symlinked next-js-boilerplate/.env.local → prod/nextjs.env`);
  } catch {
    warn("Could not create symlink for .env.local (may need manual setup)");
  }
}

// Ensure logs directories exist
for (const dir of ["logs/back", "logs/front"]) {
  const full = resolve(ROOT, dir);
  if (!existsSync(full)) {
    mkdirSync(full, { recursive: true });
    ok(`Created ${dir}/`);
  }
}

// Generate VAPID keys if missing
const nextjsEnv = resolve(ROOT, "prod/nextjs.env");
const vapidCheck = run(`grep -c "VAPID_PUBLIC_KEY=" "${nextjsEnv}" 2>/dev/null || true`, { ignoreError: true });
if (!vapidCheck || vapidCheck === "0") {
  warn("VAPID_PUBLIC_KEY not set. To generate, run: npx web-push generate-vapid-keys");
  info("Web Push features will be disabled until keys are configured.");
} else {
  ok("VAPID keys are configured");
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
    info("Check docker-compose.yml and prod/*.env files for configuration issues.");
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
