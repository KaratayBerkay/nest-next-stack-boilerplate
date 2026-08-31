// Ported from next-js-boilerplate/src/app/v1/[lang]/settings/security/page.tsx
// The SSR mfaEnabled probe moves into a server-function loader.
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";
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

const getInitialMfaEnabled = createServerFn().handler(async () => {
  try {
    const [
      { cookies },
      { ACCESS_TOKEN_COOKIE },
      { graphqlFetch, sessionTokenHeaders },
    ] = await Promise.all([
      import("next/headers"),
      import("@/lib/cookie"),
      import("@/lib/backend"),
    ]);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) return false;
    const { data } = await graphqlFetch<{ me: { mfaEnabled: boolean } }>(
      SECURITY_ME_QUERY,
      undefined,
      accessToken,
      await sessionTokenHeaders(),
      true,
    );
    return data?.me?.mfaEnabled ?? false;
  } catch {
    // Fall through — default to disabled.
    return false;
  }
});

export const Route = createFileRoute("/v1/$lang/settings/security/")({
  loader: () => getInitialMfaEnabled(),
  head: () => metadataToHead(metadata),
  component: SecurityPage,
});

function SecurityPage() {
  const initialMfaEnabled = Route.useLoaderData();
  const { lang } = Route.useParams();
  return (
    <SecurityPageContent initialMfaEnabled={initialMfaEnabled} lang={lang} />
  );
}
