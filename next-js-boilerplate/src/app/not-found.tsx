import Link from "next/link";
import { getMessages } from "@/lib/i18n/get-messages";
import { DEFAULT_LANG } from "@/constants/i18n";

export default function GlobalNotFound() {
  const t = getMessages(DEFAULT_LANG, "error");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted">{t.pageNotFound}</p>
      <Link href="/" className="text-brand underline">
        {t.backHome}
      </Link>
    </div>
  );
}
