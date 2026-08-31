// Custom server entry: run boot instrumentation (structured logging, Vault
// env loading, otel span capture) once before the first request, then hand
// off to the standard TanStack Start stream handler.

import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";
import { onRequestError, register } from "@/instrumentation";

const startupReady = register().catch((error) => {
  // Boot must not hard-fail on instrumentation problems; log and continue
  // with whatever env is already present.
  console.error("[server] instrumentation register() failed:", error);
});

const startFetch = createStartHandler(defaultStreamHandler);

export default createServerEntry({
  async fetch(request, opts) {
    await startupReady;
    try {
      return await startFetch(request, opts);
    } catch (error) {
      const url = new URL(request.url);
      onRequestError(
        error,
        { path: url.pathname, method: request.method },
        {
          routerKind: "TanStack Router",
          routePath: url.pathname,
          routeType: "route",
        },
      );
      throw error;
    }
  },
});
