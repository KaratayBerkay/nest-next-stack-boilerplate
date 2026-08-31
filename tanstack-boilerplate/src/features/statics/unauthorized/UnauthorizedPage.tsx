import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LOGIN_PATH } from "@/constants/routes";
import type { UnauthorizedPageProps } from "@/types/features/statics/UnauthorizedPage-types";

export function UnauthorizedPage({
  message = "Sign in to access this page",
  label,
}: UnauthorizedPageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-muted text-sm">{message}</p>
      <Button asChild>
        <Link href={LOGIN_PATH}>{label ?? "Sign in"}</Link>
      </Button>
    </div>
  );
}
