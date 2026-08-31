import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

const IMAGE = "nextjs-standalone-test";
const CONTAINER = "nextjs-standalone-test";
const PORT = 3200;

test.describe("F56 — Standalone build (self-hosted Docker)", () => {
  test("Docker image builds and serves the app", async () => {
    test.setTimeout(600_000);

    try {
      execSync(`docker stop ${CONTAINER} 2>/dev/null`, { timeout: 5_000 });
    } catch {}

    execSync(`docker build -t ${IMAGE} --quiet . 2>/dev/null`, {
      timeout: 300_000,
    });

    execSync(
      `docker run -d --rm --name ${CONTAINER} -p ${PORT}:3100 ${IMAGE}`,
      { timeout: 30_000 },
    );

    try {
      for (let attempt = 0; attempt < 30; attempt++) {
        try {
          const res = await fetch(`http://localhost:${PORT}`);
          if (res.ok) {
            const html = await res.text();
            expect(html).toContain("Next.js");
            return;
          }
        } catch {
          // container not ready yet
        }
        await new Promise((r) => setTimeout(r, 2_000));
      }
      throw new Error("Container never became healthy");
    } finally {
      try {
        execSync(`docker stop ${CONTAINER} 2>/dev/null`, { timeout: 10_000 });
      } catch {}
    }
  });
});
