import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PRICING_PATH } from "@/constants/routes";
import type { AccessDeniedProps } from "@/types/components/AccessDenied-types";

export function AccessDenied({
  title = "Access Denied",
  message = "You do not have permission to view this content.",
  ctaLabel = "Upgrade your plan",
  ctaHref = PRICING_PATH,
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-fg text-xl font-bold">{title}</h2>
      <p className="text-muted max-w-md text-center text-sm">{message}</p>
      <Button asChild>
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
