import { LOGIN_PATH } from "@/constants/routes";
import type { UnauthorizedPageProps } from "@/types/features/statics/UnauthorizedPage-types";

export function UnauthorizedPage({
  message = "Sign in to access this page",
  label,
}: UnauthorizedPageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-muted text-sm">{message}</p>
      <a
        href={LOGIN_PATH}
        className="bg-brand rounded-lg px-4 py-2 text-sm text-brand-fg"
      >
        {label ?? "Sign in"}
      </a>
    </div>
  );
}
