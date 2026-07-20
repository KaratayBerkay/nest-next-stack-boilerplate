#!/usr/bin/env node
const REQUIRED = ["NEXT_PUBLIC_APP_URL"];

const BACKEND_URL = process.env.BACKEND_URL ?? `http://localhost:3000`;
const _APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const missing = REQUIRED.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.error(
    `[e2e-env] Missing required env vars: ${missing.join(", ")}\n` +
      `E2E tests need a real backend. Either:\n` +
      `  1. Start the stack (docker compose --profile all up) and unset CI_NO_BACKEND\n` +
      `  2. Set CI_NO_BACKEND=1 to run only no-auth smoke tests\n`,
  );
  process.exit(1);
}

// Probe the backend health endpoint unless explicitly opting out.
if (!process.env.CI_NO_BACKEND) {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(
      `[e2e-env] Backend unreachable at ${BACKEND_URL}: ${err instanceof Error ? err.message : err}\n` +
        `E2E tests need a real backend. Either:\n` +
        `  1. Start the stack (docker compose --profile all up)\n` +
        `  2. Set CI_NO_BACKEND=1 to run only no-auth smoke tests\n`,
    );
    process.exit(1);
  }
}
