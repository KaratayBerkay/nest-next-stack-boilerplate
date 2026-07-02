import { notFound } from "next/navigation";

// Calling notFound() throws a special error that renders the nearest
// not-found.tsx boundary (v1/[lang]/not-found.tsx) and responds with HTTP 404.
export default function V1MissingPage() {
  return notFound();
}
