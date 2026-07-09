import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import { MessagesProvider } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { V1Shell } from "./V1Shell";
import { PageNavWrapper } from "./PageNavWrapper";
import type { V1LayoutProps } from "@/types/v1/V1Layout-types";
import { getSessionUser } from "@/lib/auth-ssr";
import { AuthProvider } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";

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
        <Suspense
          fallback={
            <div className="flex gap-6">
              <aside className="w-48 shrink-0 border-r pr-4" />
              <div className="flex flex-1 flex-col gap-6">
                <header className="flex items-center justify-between">
                  <div className="bg-surface-hover h-8 w-20 animate-pulse rounded" />
                </header>
                <section className="surface flex flex-col gap-2 p-5">
                  {children}
                </section>
              </div>
            </div>
          }
        >
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
