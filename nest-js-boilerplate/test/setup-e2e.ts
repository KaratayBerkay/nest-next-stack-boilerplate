// Hermetic e2e environment — runs (via jest `setupFiles`) before any test file is imported,
// so it executes before AppModule's `ConfigModule.forRoot()` reads `.env`.
//
// We pre-set external-service secrets to empty strings. dotenv only fills variables that are
// *not already present* in `process.env`, so these pre-sets win over whatever the developer
// keeps in their local `.env`. That forces the app's offline fallbacks and keeps the suite
// deterministic and free of live network calls:
//   - RESEND_API_KEY="" -> MailTransport uses its dev logger transport (provider 'dev'),
//     instead of calling the real Resend API (which rejects unverified test recipients).
//   - MXROUTE_API_KEY/SERVER/USERNAME="" -> MxrouteAccountsService.configured is false, so
//     MailProcessor never calls claimAvailableAccount()/createAccount() against the real
//     MXRoute API. Without this, every e2e run would provision a brand new real mailbox on
//     the live account (the local `MailAccount` table starts empty every run, so
//     claimAvailableAccount() always misses and falls through to createAccount()) — the same
//     runaway-account-creation pattern that triggered a real send-IP block once already.
process.env.RESEND_API_KEY = '';
process.env.MXROUTE_API_KEY = '';
process.env.MXROUTE_SERVER = '';
process.env.MXROUTE_USERNAME = '';
