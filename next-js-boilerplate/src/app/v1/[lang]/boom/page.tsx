import { Boom } from "./Boom";

export default function V1BoomPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Error handling</h2>
        <p className="text-muted text-sm">
          Trigger a render error; the segment&apos;s <code>error.tsx</code>{" "}
          catches it and offers a reset.
        </p>
      </div>
      <Boom />
    </div>
  );
}
