import { z } from "zod";
import {
  clientEnvSchema,
  serverEnvSchema,
} from "@/validators/env/schema";

export { clientEnvSchema, serverEnvSchema };

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const _envRaw = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_REALTIME_WS_URL: process.env.NEXT_PUBLIC_REALTIME_WS_URL,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
};

let _clientEnv: ClientEnv | undefined;

function ensureClientEnv(): ClientEnv {
  if (!_clientEnv) {
    const result = clientEnvSchema.safeParse(_envRaw);
    if (!result.success) {
      const missing = result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(
        `Missing client env vars — check Vault has NEXT_PUBLIC_* secrets for "frontend":\n${missing}`,
      );
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
  if (!_serverEnv) {
    const result = serverEnvSchema.safeParse({
      NODE_ENV: process.env.NODE_ENV,
      APP_URL: process.env.APP_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
      COOKIE_SAMESITE: process.env.COOKIE_SAMESITE,
      KAFKA_BROKER: process.env.KAFKA_BROKER,
    });
    if (!result.success) {
      const missing = result.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(
        `Missing server env vars — check Vault has required secrets:\n${missing}`,
      );
    }
    _serverEnv = result.data;
  }
  return _serverEnv;
}
