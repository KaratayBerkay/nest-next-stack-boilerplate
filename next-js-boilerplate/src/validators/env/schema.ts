import { z } from "zod";

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_REALTIME_WS_URL: z
    .string()
    .regex(/^(\/|wss?:\/\/)/, "expected a ws://, wss://, or /path URL"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_KEY: z.string(),
});

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]),
  KAFKA_BROKER: z.string(),
  // HMAC key for the session_user cookie (see lib/session-user-cookie.ts) —
  // server-only, never sent to the client.
  SESSION_COOKIE_SECRET: z
    .string()
    .min(32, "SESSION_COOKIE_SECRET must be at least 32 characters"),
});

export const fieldStateErrorSchema = z
  .string()
  .min(3, "This field has an error");
