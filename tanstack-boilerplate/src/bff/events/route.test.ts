// @vitest-environment node
//
// Regressions for the /api/events hardening: this endpoint is reachable
// unauthenticated and feeds the ES logging pipeline + Kafka, so its rate
// limit must not be bypassable via client-writable headers, and metadata
// (dynamic-mapped in ES) must be bounded.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const publishEventMock = vi.fn();
const graphqlFetchMock = vi.fn();
const getAccessTokenMock = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("@/lib/kafka", () => ({ publishEvent: publishEventMock }));
vi.mock("@/lib/backend", () => ({ graphqlFetch: graphqlFetchMock }));
vi.mock("@/store/ssr-cookies", () => ({ getAccessToken: getAccessTokenMock }));
vi.mock("@/lib/request-logger", () => ({
  withLogging:
    (handler: (req: Request, log: unknown) => Promise<Response>) =>
    (req: Request) =>
      handler(req, {
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
      }),
}));

function makeRequest(headers: Record<string, string>, body?: unknown) {
  return new NextRequest("http://localhost/api/events", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(
      body ?? {
        events: [
          {
            eventType: "page.view",
            clientSessionId: "cs1",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ),
  });
}

describe("BFF /api/events", () => {
  beforeEach(() => {
    vi.resetModules();
    publishEventMock.mockReset();
    publishEventMock.mockResolvedValue(undefined);
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockResolvedValue(null);
  });

  it("accepts a valid batch", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ "x-real-ip": "1.2.3.4" }));
    expect(res.status).toBe(202);
  });

  it("rate-limits on x-real-ip even when every request spoofs a fresh x-forwarded-for first hop — the first XFF hop is client-writable and previously minted a new bucket per request", async () => {
    const { POST } = await import("./route");
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const res = await POST(
        makeRequest({
          "x-real-ip": "9.9.9.9",
          "x-forwarded-for": `10.0.0.${i}, 9.9.9.9`,
        }),
      );
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });

  it("without x-real-ip, keys on the LAST forwarded hop (appended by our proxy), not the client-chosen first hop", async () => {
    const { POST } = await import("./route");
    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const res = await POST(
        makeRequest({ "x-forwarded-for": `10.0.0.${i}, 8.8.4.4` }),
      );
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });

  it("rejects metadata with more than 20 keys (ES dynamic-mapping explosion guard)", async () => {
    const { POST } = await import("./route");
    const metadata: Record<string, number> = {};
    for (let i = 0; i < 21; i++) metadata[`k${i}`] = i;
    const res = await POST(
      makeRequest(
        { "x-real-ip": "1.2.3.4" },
        {
          events: [
            {
              eventType: "page.view",
              clientSessionId: "cs1",
              timestamp: new Date().toISOString(),
              metadata,
            },
          ],
        },
      ),
    );
    expect(res.status).toBe(422);
  });

  it("rejects oversized metadata payloads", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(
        { "x-real-ip": "1.2.3.4" },
        {
          events: [
            {
              eventType: "page.view",
              clientSessionId: "cs1",
              timestamp: new Date().toISOString(),
              metadata: { blob: "x".repeat(9000) },
            },
          ],
        },
      ),
    );
    expect(res.status).toBe(422);
  });
});
