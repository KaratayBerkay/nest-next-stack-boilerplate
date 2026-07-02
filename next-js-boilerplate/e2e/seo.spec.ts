import { test, expect } from "@playwright/test";

test.describe("SEO — sitemap, robots, JSON-LD, metadata", () => {
  test("/sitemap.xml returns all static routes", async ({ page }) => {
    const res = await page.request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("<urlset");
    expect(text).toContain("<loc>");
    expect(text).toContain("/routing");
    expect(text).toContain("/v1/en");
  });

  test("/robots.txt allows all and links sitemap", async ({ page }) => {
    const res = await page.request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("User-Agent: *");
    expect(text).toContain("Disallow: /api/");
    expect(text).toContain("Sitemap:");
    expect(text).toContain("sitemap.xml");
  });

  test("root layout renders WebSite JSON-LD", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]').first();
    const content = JSON.parse((await jsonLd.textContent()) ?? "");
    expect(content["@type"]).toBe("WebSite");
    expect(content.name).toBe("Next.js Boilerplate");
  });

  test("/seo page renders BreadcrumbList JSON-LD", async ({ page }) => {
    await page.goto("/seo");
    const title = await page.title();
    expect(title).toBe("SEO — Next.js Boilerplate");

    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    const scripts: Record<string, unknown>[] = [];
    for (let i = 0; i < count; i++) {
      scripts.push(JSON.parse((await jsonLd.nth(i).textContent()) ?? ""));
    }

    const breadcrumb = scripts.find((s) => s["@type"] === "BreadcrumbList");
    expect(breadcrumb).toBeDefined();
    expect(
      (breadcrumb as Record<string, unknown>).itemListElement,
    ).toHaveLength(2);
  });

  test("metadata (title + OG) renders on /seo", async ({ page }) => {
    await page.goto("/seo");
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute(
      "content",
      "SEO — Next.js Boilerplate",
    );
  });
});
