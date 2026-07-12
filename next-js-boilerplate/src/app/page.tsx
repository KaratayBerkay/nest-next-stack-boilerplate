import Link from "next/link";
import { SITE, containerClass } from "@/constants/site";
import { DEFAULT_LANG } from "@/constants/i18n";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import type { I18nMessages } from "@/generated/i18n-messages";
import { LOGIN_PATH, REGISTER_PATH } from "@/constants/routes";
import { DemoBadge } from "@/components/DemoBadge";

export default function Home() {
  const messages = getAllMessages<I18nMessages>(DEFAULT_LANG);
  const t = messages.home;

  return (
    <main
      className={`${containerClass} flex flex-1 flex-col justify-center gap-8 py-24`}
    >
      <div className="animate-fade-in-up flex flex-col gap-4">
        <DemoBadge>Next.js 16 · Tailwind v4</DemoBadge>
        <h1 className="text-4xl font-semibold tracking-tight">{SITE.name}</h1>
        <p className="text-muted max-w-xl text-lg">{SITE.description}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={LOGIN_PATH}
            className="bg-brand rounded-lg px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t.signIn}
          </Link>
          <Link
            href={REGISTER_PATH}
            className="border-border text-fg hover:bg-surface-hover rounded-lg border px-5 py-2 text-sm font-semibold"
          >
            {t.register}
          </Link>
          <Link
            href={`/v1/${DEFAULT_LANG}/chat-room`}
            className="rounded-lg border border-green-300 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
          >
            {t.chatRoom}
          </Link>
          <Link
            href={`/v1/${DEFAULT_LANG}/messages`}
            className="rounded-lg border border-blue-300 px-5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
          >
            {t.messages}
          </Link>
        </div>
      </div>

      <section className="surface flex flex-col gap-2 p-5">
        <h2 className="text-brand text-sm font-semibold">
          {t.stylingPipeline}
        </h2>
        <ul className="text-muted list-disc pl-5 text-sm">
          <li>
            Tailwind v4 utilities + CSS-first <code>@theme</code> token (the
            brand color)
          </li>
          <li>CSS Modules (the badge above)</li>
          <li>
            Global CSS (this card&apos;s <code>.surface</code> rule)
          </li>
        </ul>
      </section>
    </main>
  );
}
