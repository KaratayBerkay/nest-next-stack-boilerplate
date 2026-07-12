import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3001"),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  KAFKA_BROKER: z.string().default("localhost:9092"),
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_REALTIME_WS_URL: z
    .string()
    .regex(/^wss?:\/\//, "expected a ws:// or wss:// URL")
    .default("ws://localhost:3000/ws"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().default(""),
  NEXT_PUBLIC_STRIPE_KEY: z.string().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export const clientEnv: ClientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_REALTIME_WS_URL: process.env.NEXT_PUBLIC_REALTIME_WS_URL,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
});

let cachedServerEnv: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called on the client");
  }
  cachedServerEnv ??= serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    COOKIE_SAMESITE: process.env.COOKIE_SAMESITE,
    KAFKA_BROKER: process.env.KAFKA_BROKER,
  });
  return cachedServerEnv;
}
