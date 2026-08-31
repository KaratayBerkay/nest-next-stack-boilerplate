// Ported from next-js-boilerplate/src/app/v1/lang/missing/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { notFound } from "next/navigation";

export const Route = createFileRoute("/v1/$lang/missing/")({
  component: V1MissingPage,
});

function V1MissingPage() {
  return notFound();
}
