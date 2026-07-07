import { cn } from "@/lib/cn";
export function Empty({ className, icon, title, description, action, ...props }: React.ComponentPropsWithoutRef<"div"> & { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return <div className={cn("flex flex-col items-center justify-center gap-2 py-12 text-center", className)} {...props}>
    {icon && <div className="text-muted mb-2">{icon}</div>}
    <p className="text-sm font-semibold">{title}</p>
    {description && <p className="text-muted max-w-xs text-xs">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>;
}
