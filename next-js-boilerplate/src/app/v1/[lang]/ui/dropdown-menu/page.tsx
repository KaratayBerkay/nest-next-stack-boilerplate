import { Suspense } from "react";
import { DropdownMenuDemo } from "./DropdownMenuDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <DropdownMenuDemo />
    </Suspense>
  );
}
