// Ported from next-js-boilerplate/src/app/i18n/lang/layout.tsx
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { containerClass } from "@/constants/site";

export const Route = createFileRoute("/i18n/$lang")({
  component: I18nLayout,
});

function I18nLayout() {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Internationalization
        </h1>
        <p className="text-muted max-w-xl text-sm">
          A <code>$lang</code> dynamic segment, server-side dictionaries, and{" "}
          <code>Accept-Language</code> negotiation in the request middleware.
        </p>
      </header>
      <section className="surface flex flex-col gap-2 p-5">
        <Outlet />
      </section>
    </main>
  );
}
