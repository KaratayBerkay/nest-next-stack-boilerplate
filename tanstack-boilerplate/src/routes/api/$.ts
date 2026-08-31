// Catch-all server route for the BFF: every /api/* request is dispatched to
// the original Next.js route handlers living under src/bff/**.
// The dispatcher is imported lazily inside the handler so no server-only code
// can leak into the client bundle.

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request }) =>
        (await import("@/bff/dispatch")).dispatchBff(request),
    },
  },
});
