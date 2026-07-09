import { NotFoundPage } from "@/features/statics";

export default function RoutingNotFound() {
  return (
    <div data-testid="not-found" className="surface flex flex-col gap-2 p-5">
      <NotFoundPage
        title="Not found"
        description="This routing resource does not exist."
        backLabel=""
        backHref=""
      />
    </div>
  );
}
