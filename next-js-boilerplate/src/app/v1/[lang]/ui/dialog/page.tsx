import { Suspense } from "react";
import { DialogDemo } from "./DialogDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <DialogDemo />
    </Suspense>
  );
}
