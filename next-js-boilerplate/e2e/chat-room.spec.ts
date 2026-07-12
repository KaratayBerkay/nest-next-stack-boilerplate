import { test, expect } from "@playwright/test";

/**
 * Chat room UI (src/views/chat-room/FreePageView.tsx — the view that
 * renders for the FREE-tier e2e fixture user, see src/lib/tier-view.tsx).
 *
 * The room sidebar uses a mobile-only-when-open layout
 * ("hidden md:flex md:w-56"), so we pin a desktop-sized viewport for this
 * whole file to keep assertions consistent across the mobile-chrome
 * project too.
 *
 * The message list/composer panel is swapped for a `ConnectionUnstable`
 * notice once useConnectionState() (src/hooks/useConnectionState.ts)
 * settles on "unstable" — which is exactly what happens without a live
 * realtime/WebSocket backend. Tests that touch the composer accept either
 * outcome rather than assuming a live connection.
 */
test.use({ viewport: { width: 1280, height: 800 } });

test.describe("Chat room", () => {
  test("renders the header and the room list", async ({ page }) => {
    await page.goto("/v1/en/chat-room");

    await expect(
      page.getByRole("heading", { name: "Chat Rooms" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "Rooms" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Online/ })).toBeVisible();

    for (const room of ["general", "random", "tech", "design", "music"]) {
      await expect(
        page.getByRole("button", { name: `# ${room}` }),
      ).toBeVisible();
    }
  });

  test("switching rooms in the sidebar updates the URL", async ({ page }) => {
    await page.goto("/v1/en/chat-room");

    await page.getByRole("button", { name: "# random" }).click();
    await expect(page).toHaveURL(/room=random/);

    await page.getByRole("button", { name: "# tech" }).click();
    await expect(page).toHaveURL(/room=tech/);
  });

  test("the Online tab shows an empty-members state with no realtime backend", async ({
    page,
  }) => {
    await page.goto("/v1/en/chat-room");

    await page.getByRole("tab", { name: /Online/ }).click();
    await expect(page.getByText("No one here yet")).toBeVisible();
  });

  test("shows the message composer, or a graceful disconnected notice if unstable", async ({
    page,
  }) => {
    await page.goto("/v1/en/chat-room");

    // Without a live WebSocket backend the connection typically settles
    // into "unstable", replacing the message list/composer with a
    // ConnectionUnstable notice (title "Disconnected"). If a backend IS
    // reachable, the composer renders instead (possibly disabled while
    // "connecting"). Both are valid, non-crashing renders.
    const composer = page.getByPlaceholder(/Message #|Connecting|Disconnected/);
    const unstableNotice = page.getByText("Disconnected", { exact: true });
    await expect(composer.or(unstableNotice).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
