import Link from "next/link";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function AccessDenied({
  title = "Access Denied",
  message = "You do not have permission to view this content.",
  ctaLabel = "Upgrade your plan",
  ctaHref = "/pricing",
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-fg text-xl font-bold">{title}</h2>
      <p className="text-muted max-w-md text-center text-sm">{message}</p>
      <Link
        href={ctaHref}
        className="bg-brand rounded-lg px-4 py-2 text-sm text-white"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
