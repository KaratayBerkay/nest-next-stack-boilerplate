import Joi from 'joi';

// Joi schema validating `process.env` at boot (the docs' headline "Schema validation" approach).
// Passed to `ConfigModule.forRoot({ validationSchema })`: a missing/invalid required var aborts
// startup with a clear error; absent optional vars fall back to the `.default()` here. `joi` is
// imported via a default import (it ships `export =`, so namespace import isn't callable under
// our nodenext + esModuleInterop config — same class as the cookie-parser/supertest issues).
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .required(),
  PORT: Joi.number().port().required(),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: Joi.string().uri().required(),

  // ── Redis ─────────────────────────────────────────────────────────────────
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),

  // ── Auth / Security secrets — missing values silently degrade without validation ──
  JWT_SECRET: Joi.string().min(16).required(),
  CSRF_SECRET: Joi.string().min(16).required(),
  COOKIE_SECRET: Joi.string().min(16).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  TOKEN_DERIVATION_SECRET: Joi.string().min(16).optional(),
  ENCRYPTION_KEY: Joi.string().min(16).when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // ── Stripe ────────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),

  // ── VAPID (Web Push) ─────────────────────────────────────────────────────
  VAPID_PUBLIC_KEY: Joi.string().optional(),
  VAPID_PRIVATE_KEY: Joi.string().optional(),
  VAPID_SUBJECT: Joi.string().optional(),

  // ── Multi-device ─────────────────────────────────────────────────────────
  MAX_DEVICES_PER_USER: Joi.number().min(1).default(10),
  MAX_SAME_IP_SESSIONS: Joi.number().min(1).default(5),
});

// The matching `validationOptions`: tolerate the many unrelated env vars this app uses
// (allowUnknown) and report every failure at once (abortEarly: false).
export const validationOptions = {
  allowUnknown: true,
  abortEarly: false,
};
