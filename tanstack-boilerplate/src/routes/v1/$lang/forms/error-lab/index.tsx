// Ported from next-js-boilerplate/src/app/v1/[lang]/forms/error-lab/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/error-lab/PageContent";
import type { Lang } from "@/constants/i18n";

const getErrorMessages = createServerFn().handler(async () => {
  const { getMessages } = await import("@/lib/i18n/get-messages");
  const load = (locale: Lang) => ({
    auth: getMessages(locale, "auth"),
    settings: getMessages(locale, "settings"),
    apiKeys: getMessages(locale, "apiKeys"),
    forms: getMessages(locale, "forms"),
    error: getMessages(locale, "error"),
  });
  return { en: load("en"), tr: load("tr") };
});

export const Route = createFileRoute("/v1/$lang/forms/error-lab/")({
  loader: () => getErrorMessages(),
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.errorLabTitle",
      "examples.errorLabDescription",
    ),
  component: ErrorLabPage,
});

function ErrorLabPage() {
  const errorMessagesByLocale = Route.useLoaderData();
  return (
    <PageContent
      errorMessagesByLocale={
        errorMessagesByLocale as unknown as Record<
          string,
          Record<string, unknown>
        >
      }
    />
  );
}
