import { notFound } from "next/navigation";

// Calling notFound() throws a special error that renders the nearest
// not-found.tsx boundary and responds with HTTP 404.
export default function MissingPage() {
  return notFound();
}
