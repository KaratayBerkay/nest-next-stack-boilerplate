import { connection } from "next/server";
import { Suspense } from "react";

function getServerData() {
  return {
    message:
      "This data was rendered on the server. It appears in the initial HTML.",
  };
}

async function Timestamp() {
  await connection();
  const renderedAt = new Date().toISOString();
  return (
    <span className="font-mono" data-testid="ssr-timestamp">
      {renderedAt}
    </span>
  );
}

export default function SsrPage() {
  const data = getServerData();
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Server-Side Rendering
      </h2>
      <p className="text-muted text-sm" data-testid="ssr-message">
        {data.message}
      </p>
      <p className="text-xs text-zinc-500">
        Rendered at:{" "}
        <Suspense
          fallback={<span className="font-mono text-zinc-400">...</span>}
        >
          <Timestamp />
        </Suspense>
      </p>
    </div>
  );
}
