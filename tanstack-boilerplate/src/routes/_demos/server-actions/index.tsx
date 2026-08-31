// Ported from next-js-boilerplate/src/app/(demos)/server-actions/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import GreetingForm from "@/views/demos/server-actions/GreetingForm";

export const metadata: Metadata = {
  title: "Server Actions",
  description: "Server actions demo",
};

export const Route = createFileRoute("/_demos/server-actions/")({
  head: () => metadataToHead(metadata),
  component: ServerActionsPage,
});

function ServerActionsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Server Actions</h2>
      <p className="text-muted text-sm">
        This form submits to a Server Action. The action processes the data and
        returns a result without a manual API route.
      </p>
      <GreetingForm />
    </div>
  );
}
