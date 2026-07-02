import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Static metadata",
  description: "Demonstrating static metadata export.",
  openGraph: {
    title: "Static OG title",
    description: "Static OG description.",
  },
};

export default function MetadataDemoPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Metadata demo</h1>
      <p className="text-muted text-sm">
        This page exports a static <code>metadata</code> object. The
        <code>&lt;title&gt;</code> and OG tags should be present in the rendered
        HTML.
      </p>
    </div>
  );
}
