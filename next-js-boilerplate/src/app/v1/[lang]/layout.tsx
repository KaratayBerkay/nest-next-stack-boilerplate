import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import { MessagesProvider } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { V1Shell } from "@/views/v1/[lang]/V1Shell";
import { PageNavWrapper } from "@/views/v1/[lang]/PageNavWrapper";
import type { V1LayoutProps } from "@/types/v1/V1Layout-types";
import { getSessionUser } from "@/lib/auth-ssr";
import { AuthProvider } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";
import { V1ShellFallback } from "@/fallbacks";

export default async function V1Layout({
  children,
  params,
}: V1LayoutProps) {
  const { lang } = await params;
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  const messages = getAllMessages<I18nMessages>(lang);

  return (
    <AuthProvider initialUser={user}>
    <MessagesProvider messages={messages}>
      <main className="flex w-full flex-1 flex-col">
        <Suspense fallback={<V1ShellFallback />}>
          <V1Shell>
            <Suspense
              fallback={
                <section className="surface flex flex-col gap-2 p-5">
                  {children}
                </section>
              }
            >
              <PageNavWrapper>{children}</PageNavWrapper>
            </Suspense>
          </V1Shell>
        </Suspense>
      </main>
    </MessagesProvider>
    </AuthProvider>
  );
}
