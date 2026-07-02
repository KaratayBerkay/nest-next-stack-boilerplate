import { containerClass } from "@/constants/site";

// Route group layout.
//
// The `(marketing)` folder groups related routes WITHOUT adding a URL segment —
// yet it can still own a shared layout. So /about and /pricing both render
// inside this shell even though "marketing" never appears in the URL. Route
// groups exist to organize files and scope layouts, not to shape the path.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header data-testid="marketing-shell" className="flex flex-col gap-1">
        <p className="text-brand text-xs font-semibold tracking-wide uppercase">
          Marketing
        </p>
        <p className="text-muted text-xs">
          Shared layout from the <code>(marketing)</code> route group — not part
          of the URL.
        </p>
      </header>
      <section className="surface flex flex-col gap-2 p-5">{children}</section>
    </main>
  );
}
