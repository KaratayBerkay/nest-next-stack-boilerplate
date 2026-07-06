import { redirect } from "next/navigation";

export default async function SettingsIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/v1/${lang}/settings/general`);
}
