import { test, expect } from "@playwright/test";

/**
 * KNOWN LIMITATION: the e2e fixture user (e2e/helpers/auth.ts,
 * ensureTestUser) is a freshly registered/activated USER-role account.
 * The only dev-only escalation endpoint in this app is
 * /api/auth/dev-activate (backed by the backend's `devActivateUser`
 * mutation, gated by ALLOW_DEV_ACTIVATE), which flips a user from
 * PENDING_VERIFICATION to ACTIVE — it does NOT grant ADMIN/SUPERADMIN
 * role. There is no e2e-safe way to provision an admin user, so these
 * tests intentionally do NOT fake privilege escalation. They instead
 * cover the access-denied gate a non-admin sees, per
 * src/views/admin/audit-logs/PageContent.tsx:
 *   const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
 *   if (!isAdmin) return <AccessDeniedPage message={t.accessDenied} />;
 *
 * The full admin-only UI (filters, table, pagination, diff viewer) is
 * NOT exercised by this suite — that would require a real admin fixture.
 */
test.describe("Admin audit logs (non-admin fixture user)", () => {
  test("shows an access-denied message instead of the audit log table", async ({
    page,
  }) => {
    await page.goto("/v1/en/admin/audit-logs");

    await expect(
      page.getByRole("heading", { name: "Audit Log" }),
    ).toBeVisible();
    await expect(page.getByText("Access denied. Admins only.")).toBeVisible();
  });

  test("does not render the audit log filters or table for a non-admin user", async ({
    page,
  }) => {
    await page.goto("/v1/en/admin/audit-logs");

    // These only mount once `isAdmin` is true (see PageContent.tsx), so a
    // non-admin should see none of them.
    await expect(page.getByPlaceholder("Entity type...")).toHaveCount(0);
    await expect(page.locator("table")).toHaveCount(0);
    await expect(page.getByText("No audit log entries found.")).toHaveCount(0);
  });

  test("the admin audit-logs API rejects a request from a non-admin session", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/audit-logs");

    // src/app/api/admin/audit-logs/route.ts returns 401 if there's no
    // access-token cookie at all; if the token is present but the backend
    // GraphQL role guard rejects the query, graphqlErrorStatus() maps a
    // FORBIDDEN GraphQL error to 403 (src/lib/backend.ts). Either way, a
    // non-admin session must never get a 200 with real audit log data.
    expect(res.status()).not.toBe(200);
    expect([401, 403]).toContain(res.status());
  });
});
