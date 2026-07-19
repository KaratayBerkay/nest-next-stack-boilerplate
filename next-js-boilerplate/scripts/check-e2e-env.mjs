#!/usr/bin/env node
const REQUIRED = ["NEXT_PUBLIC_APP_URL"];

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
