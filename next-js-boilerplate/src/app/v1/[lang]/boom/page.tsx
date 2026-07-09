import type { Metadata } from "next";
import { V1Boom } from "@/views/boom/V1Boom";
import { PageInfoButton } from "@/components/ui/page-info";
import { boomPageInfo } from "@/constants/page-info";

export const metadata: Metadata = {
  title: "Error Handling",
  description: "Error handling demo",
};

export default function V1BoomPage() {
  return (
    <div className="flex flex-col gap-5">
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
