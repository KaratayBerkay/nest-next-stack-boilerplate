import { cookies } from "next/headers";
import { LANG_COOKIE, LANGS, DEFAULT_LANG } from "@/constants/i18n";
import type { Lang } from "@/constants/i18n";

export async function getBasePath(): Promise<string> {
  const cookieStore = await cookies();
  const val = cookieStore.get(LANG_COOKIE)?.value;
  const lang =
    val && (LANGS as readonly string[]).includes(val)
      ? (val as Lang)
      : DEFAULT_LANG;
  return `/v1/${lang}`;
}
