import Link from "next/link";
import { PRICING_PATH } from "@/constants/routes";

export function FreePageView() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-sm text-muted">
        Upgrade to view premium features and stats.
      </p>
      <Link
        href={PRICING_PATH}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
      >
        View plans
      </Link>
    </div>
  );
}
