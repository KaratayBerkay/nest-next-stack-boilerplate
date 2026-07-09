import { LoadingPage } from "@/features/statics";

export default function Loading() {
  return (
    <p data-testid="route-loading">
      <LoadingPage text="Loading the slow route…" />
    </p>
  );
}
