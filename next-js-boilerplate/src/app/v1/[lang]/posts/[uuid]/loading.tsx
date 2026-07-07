export default function PostDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl min-h-0 max-h-full flex-col gap-4 overflow-y-auto py-6 max-md:px-1">
      <div className="bg-surface-hover h-4 w-12 animate-pulse rounded" />
      <div className="border-border surface flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
          <div className="flex flex-col gap-1">
            <div className="bg-surface-hover h-3 w-24 animate-pulse rounded" />
            <div className="bg-surface-hover h-2 w-16 animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-surface-hover h-6 w-3/4 animate-pulse rounded" />
        <div className="flex flex-col gap-2">
          <div className="bg-surface-hover h-3 w-full animate-pulse rounded" />
          <div className="bg-surface-hover h-3 w-5/6 animate-pulse rounded" />
          <div className="bg-surface-hover h-3 w-2/3 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
