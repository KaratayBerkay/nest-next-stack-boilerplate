import { test, expect } from "@playwright/test";

const NONCE_RE = /'nonce-([^']+)'/;

test("CSP header on /security/csp carries strict nonce directives", async ({
  request,
}) => {
  const res = await request.get("/security/csp");
  const csp = res.headers()["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toMatch(NONCE_RE);
});

test("the nonce is fresh on every request", async ({ request }) => {
  const a = (await request.get("/security/csp")).headers()[
    "content-security-policy"
  ];
  const b = (await request.get("/security/csp")).headers()[
    "content-security-policy"
  ];
  const na = a.match(NONCE_RE)?.[1];
  const nb = b.match(NONCE_RE)?.[1];
  expect(na).toBeTruthy();
  expect(nb).toBeTruthy();
  expect(na).not.toBe(nb);
});

test("the page renders the same per-request nonce it received", async ({
  request,
}) => {
  const res = await request.get("/security/csp");
  const nonce = res.headers()["content-security-policy"].match(NONCE_RE)?.[1];
  const html = await res.text();
  // proxy → x-nonce request header → headers() in the RSC → rendered output.
  expect(nonce).toBeTruthy();
  expect(html).toContain('data-testid="csp-nonce"');
  expect(html).toContain(nonce!);
});

test("strict CSP is scoped: non-/security routes get no nonce CSP", async ({
  request,
}) => {
  const res = await request.get("/about");
  expect(res.headers()["content-security-policy"]).toBeUndefined();
  // proxy still runs everywhere — only the strict CSP is scoped.
  expect(res.headers()["x-proxy"]).toBe("active");
});
