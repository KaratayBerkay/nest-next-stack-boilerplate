import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function UILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-border bg-bg/80 sticky top-0 z-50 -mx-4 mb-4 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">UI Components</span>
          <span className="text-muted text-xs">/v1/:lang/ui/:component</span>
        </div>
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
