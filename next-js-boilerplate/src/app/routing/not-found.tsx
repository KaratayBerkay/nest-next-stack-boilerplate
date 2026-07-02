// Segment not-found boundary. Rendered when a descendant calls notFound().
export default function RoutingNotFound() {
  return (
    <div data-testid="not-found" className="surface flex flex-col gap-2 p-5">
      <h2 className="text-sm font-semibold">Not found</h2>
      <p className="text-muted text-sm">
        This routing resource does not exist.
      </p>
    </div>
  );
}
