import { Suspense } from "react";
import { SelectDemo } from "./SelectDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <SelectDemo />
    </Suspense>
  );
}
