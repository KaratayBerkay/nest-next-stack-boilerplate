"use client";

import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
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
