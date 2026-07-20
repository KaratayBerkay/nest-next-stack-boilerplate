import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  KAFKA_BROKER: z.string(),
});

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_REALTIME_WS_URL: z
    .string()
    .regex(/^(\/|wss?:\/\/)/, "expected a ws://, wss://, or /path URL"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().default(""),
  NEXT_PUBLIC_STRIPE_KEY: z.string().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

const _envRaw = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_REALTIME_WS_URL: process.env.NEXT_PUBLIC_REALTIME_WS_URL,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
};

let _clientEnv: ClientEnv | undefined;
let _clientEnvError: Error | undefined;

function ensureClientEnv(): ClientEnv {
  if (!_clientEnv) {
    const result = clientEnvSchema.safeParse(_envRaw);
    if (!result.success) {
      _clientEnvError = new Error(
        `Missing required client env vars. Check NEXT_PUBLIC_* variables are set at build time.\n${result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")}`,
      );
      throw _clientEnvError;
    }
    _clientEnv = result.data;
  }
  return _clientEnv;
}

export const clientEnv = new Proxy({} as ClientEnv, {
  get(_, prop) {
    return Reflect.get(ensureClientEnv(), prop);
  },
});

let _serverEnv: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called on the client");
  }
  _serverEnv ??= serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    COOKIE_SAMESITE: process.env.COOKIE_SAMESITE,
    KAFKA_BROKER: process.env.KAFKA_BROKER,
  });
  return _serverEnv;
}
