import { Suspense } from "react";
import { Timestamp } from "./Timestamp";

export default function DynamicPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Dynamic rendering</h2>
      <p className="text-muted text-sm">
        This page uses{" "}
        <code className="bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          connection()
        </code>{" "}
        — a fresh timestamp every request.
      </p>
      <p className="text-xs text-zinc-500">
        Rendered at:{" "}
        <Suspense
          fallback={<span className="font-mono text-zinc-400">loading...</span>}
        >
          <Timestamp />
        </Suspense>
      </p>
    </div>
  );
}
