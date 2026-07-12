"use client";

import type { GlobalErrorProps } from "@/types/app/GlobalError-types";

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <h1 className="text-2xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="text-muted">{error.message}</p>
        {error.digest ? (
          <p className="text-muted text-sm">
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}
        <button
          type="button"
          className="text-brand underline"
          onClick={() => reset()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
