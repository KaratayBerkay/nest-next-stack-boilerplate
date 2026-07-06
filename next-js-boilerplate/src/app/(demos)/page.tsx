import Link from "next/link";

export default function DemosIndex() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Rendering demos</h2>
      <p className="text-muted text-sm">
        Select a demo from the navigation above.
      </p>
      <nav className="flex flex-col gap-1 text-sm">
        <Link className="text-brand underline" href="/ssr">
          SSR
        </Link>
        <Link className="text-brand underline" href="/csr">
          CSR
        </Link>
        <Link className="text-brand underline" href="/static">
          Static
        </Link>
        <Link className="text-brand underline" href="/dynamic">
          Dynamic
        </Link>
        <Link className="text-brand underline" href="/ppr">
          PPR
        </Link>
        <Link className="text-brand underline" href="/data-fetching">
          Data Fetching
        </Link>
        <Link className="text-brand underline" href="/request-memoization">
          Request Memoization
        </Link>
        <Link className="text-brand underline" href="/caching">
          Caching & Revalidating
        </Link>
        <Link className="text-brand underline" href="/server-actions">
          Server Actions
        </Link>
        <Link className="text-brand underline" href="/client-data">
          Client Data (TanStack Query)
        </Link>
        <Link className="text-brand underline" href="/sse">
          SSE
        </Link>
        <Link className="text-brand underline" href="/ws">
          WebSocket
        </Link>
        <Link className="text-brand underline" href="/v1/en/find-friends">
          Find Friends
        </Link>
        <Link className="text-brand underline" href="/ssr-cookies">
          SSR Cookies
        </Link>
        <Link className="text-brand underline" href="/csr-cookies">
          CSR Cookies
        </Link>
        <Link className="text-brand underline" href="/lazy-loading">
          Lazy Loading
        </Link>
        <Link className="text-brand underline" href="/images">
          Images
        </Link>
        <Link className="text-brand underline" href="/scripts">
          Scripts
        </Link>
        <Link className="text-brand underline" href="/fonts">
          Fonts
        </Link>
        <Link className="text-brand underline" href="/search-params">
          Search Params
        </Link>
        <Link className="text-brand underline" href="/form">
          Form
        </Link>
        <Link className="text-brand underline" href="/observability">
          Instrumentation &amp; OpenTelemetry
        </Link>
      </nav>
    </div>
  );
}
