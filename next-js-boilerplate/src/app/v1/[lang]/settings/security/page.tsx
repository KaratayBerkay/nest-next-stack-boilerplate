import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, sessionTokenHeaders } from "@/lib/backend";
import SecurityPageContent from "@/views/settings/security/PageContent";

export const metadata: Metadata = {
  title: "Security Settings",
  description: "Manage two-factor authentication",
};

const SECURITY_ME_QUERY = `
  query Me {
    me {
      mfaEnabled
    }
  }
`;

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  let initialMfaEnabled = false;

  try {
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (accessToken) {
      const { data } = await graphqlFetch<{ me: { mfaEnabled: boolean } }>(
        SECURITY_ME_QUERY,
        undefined,
        accessToken,
        await sessionTokenHeaders(),
      );
      initialMfaEnabled = data?.me?.mfaEnabled ?? false;
    }
  } catch {
    // Fall through — default to disabled.
  }

  return (
    <SecurityPageContent initialMfaEnabled={initialMfaEnabled} lang={lang} />
  );
}
