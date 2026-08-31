import type { Metadata } from "next";
import { Counter } from "@/components/ui/Counter";

export const metadata: Metadata = {
  title: "Route A",
  description: "Demo route A",
};

export default function RoutingPageA() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Demo A</h2>
      <div className="text-xs text-zinc-500">
        <Counter label="page" />
      </div>
    </div>
  );
}
