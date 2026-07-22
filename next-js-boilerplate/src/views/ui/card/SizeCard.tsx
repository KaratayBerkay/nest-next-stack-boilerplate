import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { sizes } from "./variant-gallery-data";

export function SizeCard({ size }: { size: (typeof sizes)[number] }) {
  return (
    <Card key={size} className="min-w-40">
      <CardContent
        className={cn(
          "flex flex-col items-center justify-center",
          size === "sm" ? "p-3" : size === "lg" ? "p-8" : "p-5",
        )}
      >
        <span className="text-muted text-xs font-medium tracking-wider uppercase">
          {size}
        </span>
        <span className="text-muted/60 mt-1 text-[10px]">
          {size === "sm" ? "p-3" : size === "lg" ? "p-6-8" : "p-4-5"}
        </span>
      </CardContent>
    </Card>
  );
}
