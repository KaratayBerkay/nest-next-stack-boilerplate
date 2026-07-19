import { defineConfig, devices } from "@playwright/test";

// E2E_PORT override lets local runs avoid a port already claimed by the
// dockerized app (CI leaves it unset → 3100).
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;
const AUTH_STATE = "playwright/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    storageState: AUTH_STATE,
  },
  projects: [
    {
      name: "setup",
      testMatch: /setup\.spec\.ts$/,
      use: { storageState: { cookies: [], origins: [] } },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `node scripts/check-e2e-env.mjs && pnpm exec next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
