import { describe, it, expect } from "vitest";
import { clientEnvSchema, serverEnvSchema } from "@/lib";

describe("env schemas", () => {
  const MINIMAL_CLIENT = {
    NEXT_PUBLIC_APP_URL: "http://localhost:3001",
    NEXT_PUBLIC_REALTIME_WS_URL: "/ws",
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "",
    NEXT_PUBLIC_STRIPE_KEY: "",
  };

  const MINIMAL_SERVER = {
    NODE_ENV: "development",
    APP_URL: "http://app:3000",
    NEXT_PUBLIC_APP_URL: "http://localhost:3001",
    COOKIE_SAMESITE: "lax",
    KAFKA_BROKER: "disabled",
  };

  it("accepts minimal valid client env", () => {
    expect(clientEnvSchema.safeParse(MINIMAL_CLIENT).success).toBe(true);
  });

  it("accepts a valid WebSocket URL", () => {
    expect(
      clientEnvSchema.safeParse({
        ...MINIMAL_CLIENT,
        NEXT_PUBLIC_REALTIME_WS_URL: "wss://api.eys.gen.tr/ws",
      }).success,
    ).toBe(true);
  });

  it("accepts a relative WebSocket path", () => {
    expect(
      clientEnvSchema.safeParse({
        ...MINIMAL_CLIENT,
        NEXT_PUBLIC_REALTIME_WS_URL: "/ws",
      }).success,
    ).toBe(true);
  });

  it("rejects a non-ws WebSocket URL", () => {
    expect(
      clientEnvSchema.safeParse({
        ...MINIMAL_CLIENT,
        NEXT_PUBLIC_REALTIME_WS_URL: "http://nope",
      }).success,
    ).toBe(false);
  });

  it("rejects missing client env vars", () => {
    expect(clientEnvSchema.safeParse({}).success).toBe(false);
  });

  it("accepts minimal valid server env", () => {
    expect(serverEnvSchema.safeParse(MINIMAL_SERVER).success).toBe(true);
  });

  it("rejects an invalid backend URL", () => {
    expect(
      serverEnvSchema.safeParse({ ...MINIMAL_SERVER, APP_URL: "not-a-url" })
        .success,
    ).toBe(false);
  });
});
