import type { Metadata } from "next";
import { RoutingBoom } from "@/views/boom/RoutingBoom";

export const metadata: Metadata = {
  title: "Error Handling",
  description: "Error boundary demo",
};

export default function BoomPage() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-brand text-sm font-semibold">Error handling</h2>
      <p className="text-muted text-sm">
        Trigger a render error; the segment&apos;s <code>error.tsx</code>{" "}
        catches it and offers a reset.
      </p>
      <RoutingBoom />
    </div>
  );
}
