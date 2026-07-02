import { Suspense } from "react";
import { CommandDemo } from "./CommandDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <CommandDemo />
    </Suspense>
  );
}
