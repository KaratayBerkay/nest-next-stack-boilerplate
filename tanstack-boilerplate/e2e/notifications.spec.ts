import { test, expect } from "@playwright/test";

test.describe("Notifications", () => {
  test("notification bell is visible in the header", async ({ page }) => {
    await page.goto("/v1/en/feed");

    const bellButton = page
      .locator("button")
      .filter({ has: page.locator("svg") });
    await expect(bellButton.first()).toBeVisible();
  });

  test("unread count api returns a number", async ({ request }) => {
    const res = await request.get("/api/notifications/unread-count");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(typeof data.count).toBe("number");
  });

  test("notifications api returns an array", async ({ request }) => {
    const res = await request.get("/api/notifications");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.notifications)).toBe(true);
  });

  test("posts api returns posts array", async ({ request }) => {
    const res = await request.get("/api/posts");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.posts)).toBe(true);
  });

  test("single post api returns 404 for nonexistent", async ({ request }) => {
    const res = await request.get("/api/posts/nonexistent-id");
    expect(res.status()).toBe(404);
  });

  test("create post rejects missing title", async ({ request }) => {
    const res = await request.post("/api/posts", {
      data: { content: "test content" },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Title and content are required");
  });

  test("create comment rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/comments", {
      data: { body: "test" },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("postId and body are required");
  });

  test("create reaction rejects missing type", async ({ request }) => {
    const res = await request.post("/api/reactions", {
      data: { postId: "some-id" },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("type is required");
  });

  test("mark notification read rejects missing id", async ({ request }) => {
    const res = await request.post("/api/notifications/read", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("id is required");
  });
});
