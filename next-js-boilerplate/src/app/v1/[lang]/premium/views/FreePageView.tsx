import Link from "next/link";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function FreePageView() {
  const t = useMessages("premium");

  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-sm text-muted">
        {t.upgradeMessage}
      </p>
      <Link
        href={PRICING_PATH}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
      >
        {t.viewPlans}
      </Link>
    </div>
  );
}
