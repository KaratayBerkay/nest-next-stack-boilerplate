// Ported from next-js-boilerplate/src/app/dashboard/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard overview",
};

export const Route = createFileRoute("/dashboard/")({
  head: () => metadataToHead(metadata),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <p data-testid="dashboard-main" className="text-muted text-sm">
      Main content (the implicit <code>children</code> slot).
    </p>
  );
}
