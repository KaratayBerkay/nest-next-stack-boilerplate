import { Suspense } from "react";
import { TabsDemo } from "./TabsDemo";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <TabsDemo />
    </Suspense>
  );
}
