import { describe, it, expect } from "vitest";
import { clientEnvSchema, serverEnvSchema } from "@/lib";

describe("env schemas", () => {
  it("applies NODE_ENV default", () => {
    const parsed = serverEnvSchema.parse({
      APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_URL: "http://localhost:3001",
      KAFKA_BROKER: "localhost:9092",
      NEXT_PUBLIC_REALTIME_WS_URL: "/ws",
    });
    expect(parsed.NODE_ENV).toBe("development");
  });

  it("accepts a valid WebSocket URL", () => {
    expect(
      clientEnvSchema.safeParse({
        NEXT_PUBLIC_APP_URL: "http://localhost:3001",
        NEXT_PUBLIC_REALTIME_WS_URL: "wss://app.eys.gen.tr/ws",
      }).success,
    ).toBe(true);
  });

  it("accepts a relative WebSocket path", () => {
    expect(
      clientEnvSchema.safeParse({
        NEXT_PUBLIC_APP_URL: "http://localhost:3001",
        NEXT_PUBLIC_REALTIME_WS_URL: "/ws",
      }).success,
    ).toBe(true);
  });

  it("rejects a non-ws WebSocket URL", () => {
    expect(
      clientEnvSchema.safeParse({
        NEXT_PUBLIC_APP_URL: "http://localhost:3001",
        NEXT_PUBLIC_REALTIME_WS_URL: "http://nope",
      }).success,
    ).toBe(false);
  });

  it("rejects a missing required env", () => {
    expect(clientEnvSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an invalid backend URL", () => {
    expect(
      serverEnvSchema.safeParse({
        APP_URL: "not-a-url",
        NEXT_PUBLIC_APP_URL: "http://localhost:3001",
        KAFKA_BROKER: "localhost:9092",
        NEXT_PUBLIC_REALTIME_WS_URL: "/ws",
      }).success,
    ).toBe(false);
  });
});
