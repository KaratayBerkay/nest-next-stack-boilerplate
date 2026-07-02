import { Suspense } from "react";
import { PopoverDemo } from "./PopoverDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <PopoverDemo />
    </Suspense>
  );
}
