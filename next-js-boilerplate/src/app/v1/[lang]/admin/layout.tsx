import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth-ssr";
import { getMessages } from "@/lib/i18n/get-messages";
import { isAdminRole } from "@/lib/auth/admin-role";
import { AccessDeniedPage } from "@/features/statics";
import type { Lang } from "@/constants/i18n";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

/**
 * Server-side role gate for every /admin/* segment (CROSS-039). The v1 layout
 * above only proves the session exists; before this the role was checked
 * solely inside the client `PageContent`, so the admin page shell (and its
 * client bundle) was still served to any signed-in user. The in-component
 * check stays as defense in depth; the real mutations are backend-gated.
 */
export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { lang } = await params;
  const user = await getSessionUser();
  if (!isAdminRole(user?.role)) {
    const t = getMessages(lang as Lang, "admin");
    return <AccessDeniedPage message={t.accessDenied} />;
  }
  return <>{children}</>;
}
