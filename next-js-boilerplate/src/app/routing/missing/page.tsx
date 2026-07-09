import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Missing",
  description: "Not found demo",
};

// Calling notFound() throws a special error that renders the nearest
// not-found.tsx boundary and responds with HTTP 404.
export default function MissingPage() {
  return notFound();
}
