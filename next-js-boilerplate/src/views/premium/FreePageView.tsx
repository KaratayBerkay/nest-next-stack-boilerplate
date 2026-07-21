import Link from "next/link";
import { PRICING_PATH } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function FreePageView({ className }: { className?: string }) {
  const t = useMessages("premium");

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center gap-6 py-20",
        className,
      )}
    >
      <p className="text-muted text-sm">{t.upgradeMessage}</p>
      <Link
        href={PRICING_PATH}
        className="bg-brand hover:bg-brand/90 text-brand-fg rounded-lg px-4 py-2 text-sm font-medium"
      >
        {t.viewPlans}
      </Link>
    </div>
  );
}
