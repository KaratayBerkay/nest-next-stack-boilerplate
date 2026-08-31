export function V1ShellFallback() {
  return (
    <div className="flex gap-6">
      <aside className="w-48 shrink-0 border-r pr-4" />
      <div className="flex flex-1 flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="bg-surface-hover h-8 w-20 animate-pulse rounded" />
        </header>
        <section className="surface flex flex-col gap-2 p-5" />
      </div>
    </div>
  );
}
