import Link from "next/link";
import { PRICING_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function FreePageView() {
  const t = useMessages("premium");

  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <p className="text-muted text-sm">{t.upgradeMessage}</p>
      <Link
        href={PRICING_PATH}
        className="bg-brand hover:bg-brand/90 rounded-lg px-4 py-2 text-sm font-medium text-white"
      >
        {t.viewPlans}
      </Link>
    </div>
  );
}
