import type { ReactNode } from "react";
import { LoadingAuth } from "./LoadingAuth";
import { UnauthenticatedMessage } from "./UnauthenticatedMessage";

export function AuthGuard({
  loading,
  user,
  message,
  children,
}: {
  loading: boolean;
  user: unknown;
  message: string;
  children: ReactNode;
}) {
  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={message} />;
  return <>{children}</>;
}
