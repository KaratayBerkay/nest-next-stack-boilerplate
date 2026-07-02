// Hermetic e2e environment — runs (via jest `setupFiles`) before any test file is imported,
// so it executes before AppModule's `ConfigModule.forRoot()` reads `.env`.
//
// We pre-set external-service secrets to empty strings. dotenv only fills variables that are
// *not already present* in `process.env`, so these pre-sets win over whatever the developer
// keeps in their local `.env`. That forces the app's offline fallbacks and keeps the suite
// deterministic and free of live network calls:
//   - RESEND_API_KEY="" -> MailTransport uses its dev logger transport (provider 'dev'),
//     instead of calling the real Resend API (which rejects unverified test recipients).
process.env.RESEND_API_KEY = '';
