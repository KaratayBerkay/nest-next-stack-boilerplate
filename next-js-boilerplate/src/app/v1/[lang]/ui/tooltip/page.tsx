import { Suspense } from "react";
import { TooltipDemo } from "./TooltipDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <TooltipDemo />
    </Suspense>
  );
}
