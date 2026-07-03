import { describe, it, expect } from "vitest";
import { clientEnvSchema, serverEnvSchema } from "@/lib";

describe("env schemas", () => {
  it("applies defaults when vars are absent", () => {
    const parsed = clientEnvSchema.parse({});
    expect(parsed.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(parsed.NEXT_PUBLIC_REALTIME_WS_URL).toBe("ws://localhost:3000/ws");
  });

  it("accepts a valid WebSocket URL", () => {
    expect(
      clientEnvSchema.safeParse({ NEXT_PUBLIC_REALTIME_WS_URL: "wss://app.eys.gen.tr/ws" }).success,
    ).toBe(true);
  });

  it("rejects a non-ws WebSocket URL", () => {
    expect(
      clientEnvSchema.safeParse({ NEXT_PUBLIC_REALTIME_WS_URL: "http://nope" }).success,
    ).toBe(false);
  });

  it("rejects an invalid backend URL", () => {
    expect(serverEnvSchema.safeParse({ APP_URL: "not-a-url" }).success).toBe(
      false,
    );
  });
});
