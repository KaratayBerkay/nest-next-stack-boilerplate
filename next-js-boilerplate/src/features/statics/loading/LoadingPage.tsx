import type { LoadingPageProps } from "@/types/features/statics/LoadingPage-types";

export function LoadingPage({ text = "Loading..." }: LoadingPageProps) {
  return (
    <p className="text-muted animate-pulse text-sm">{text}</p>
  );
}
