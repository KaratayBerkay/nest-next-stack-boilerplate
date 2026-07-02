// Demo-only signing secret for the Passport recipe. The docs themselves warn: in a real app
// load this from config/a secret store, never hardcode it. (The app's primary GraphQL auth in
// src/auth already does that via ConfigService — this module mirrors the docs verbatim.)
export const jwtConstants = {
  secret: 'passport-recipe-demo-secret-do-not-use-in-prod',
};
