import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LOGIN_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UnauthenticatedMessageProps } from "@/types/components/UnauthenticatedMessage-types";

export function UnauthenticatedMessage({
  message,
  label,
}: UnauthenticatedMessageProps) {
  const t = useMessages("home");
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-muted text-sm">{message}</p>
      <Button asChild>
        <Link href={LOGIN_PATH}>{label ?? t.signIn}</Link>
      </Button>
    </div>
  );
}
