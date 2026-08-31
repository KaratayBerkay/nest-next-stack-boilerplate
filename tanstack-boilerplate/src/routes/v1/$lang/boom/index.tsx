// Ported from next-js-boilerplate/src/app/v1/lang/boom/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { V1Boom } from "@/views/boom/V1Boom";
import { PageInfoButton } from "@/components/ui/page-info";
import { boomPageInfo } from "@/constants/page-info";

export const metadata: Metadata = {
  title: "Error Handling",
  description: "Error handling demo",
};

export const Route = createFileRoute("/v1/$lang/boom/")({
  head: () => metadataToHead(metadata),
  component: V1BoomPage,
});

function V1BoomPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">Error handling</h2>
          <p className="text-muted text-sm">
            Trigger a render error; the segment&apos;s <code>error.tsx</code>{" "}
            catches it and offers a reset.
          </p>
        </div>
        <PageInfoButton content={boomPageInfo} />
      </div>
      <V1Boom />
    </div>
  );
}
