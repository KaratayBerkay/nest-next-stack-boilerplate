import Joi from 'joi';

// Joi schema validating `process.env` at boot (the docs' headline "Schema validation" approach).
// Passed to `ConfigModule.forRoot({ validationSchema })`: a missing/invalid required var aborts
// startup with a clear error; absent optional vars fall back to the `.default()` here. `joi` is
// imported via a default import (it ships `export =`, so namespace import isn't callable under
// our nodenext + esModuleInterop config — same class as the cookie-parser/supertest issues).
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(3000),
});

// The matching `validationOptions`: tolerate the many unrelated env vars this app uses
// (allowUnknown) and report every failure at once (abortEarly: false).
export const validationOptions = {
  allowUnknown: true,
  abortEarly: false,
};
