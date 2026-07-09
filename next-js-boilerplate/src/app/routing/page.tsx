import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Routing",
  description: "Routing examples",
};

export default function RoutingIndex() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Layouts &amp; pages</h2>
      <p className="text-muted text-sm">
        Pick a page above, then click the counters: the layout&apos;s count
        survives navigation between pages while each page&apos;s count resets —
        the layout stays mounted and the page subtree is recreated.
      </p>
      <Link className="text-brand underline" href="/routing/slow">
        Slow route (loading &amp; streaming) →
      </Link>
    </div>
  );
}
