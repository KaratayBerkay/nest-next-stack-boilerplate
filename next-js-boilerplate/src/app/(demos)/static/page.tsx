import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Static",
  description: "Static generation demo",
};

async function BuildTimestamp() {
  return new Date().toISOString();
}

export default async function StaticPage() {
  const builtAt = await BuildTimestamp();
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Static rendering</h2>
      <p className="text-muted text-sm">
        This page was statically prerendered at build time.
      </p>
      <p className="text-xs text-zinc-500">
        Built at:{" "}
        <span className="font-mono" data-testid="static-timestamp">
          {builtAt}
        </span>
      </p>
    </div>
  );
}
