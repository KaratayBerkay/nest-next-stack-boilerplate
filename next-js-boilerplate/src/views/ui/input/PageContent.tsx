"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const InputDemo = dynamic(() => import("./InputDemo"), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <InputDemo />
    </Suspense>
  );
}
