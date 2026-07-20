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
      <a
        href={LOGIN_PATH}
        className="bg-brand rounded-lg px-4 py-2 text-sm text-brand-fg"
      >
        {label ?? t.signIn}
      </a>
    </div>
  );
}
