import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const users = [
  { name: "Alice Chen", role: "Admin", status: "online" as const, avatar: "AC" },
  { name: "Bob Kumar", role: "Editor", status: "away" as const, avatar: "BK" },
  { name: "Carol Smith", role: "Viewer", status: "offline" as const, avatar: "CS" },
];

function statusColor(status: "online" | "away" | "offline") {
  if (status === "online") return "bg-success";
  if (status === "away") return "bg-warning";
  return "bg-border";
}

export function UserRolesSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">User Roles</h3>
      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.name}
            className="surface flex items-center gap-4 rounded-lg border p-4 shadow-sm"
          >
            <div className="relative">
              <div className="bg-surface flex size-12 items-center justify-center rounded-full text-base font-medium">
                {user.avatar}
              </div>
              <span
                className={cn(
                  "border-bg absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2",
                  statusColor(user.status),
                )}
              />
            </div>
            <div className="flex-1">
              <p className="text-base font-medium">{user.name}</p>
              <p className="text-muted text-sm">{user.status}</p>
            </div>
            <Badge
              variant={
                user.role === "Admin"
                  ? "default"
                  : user.role === "Editor"
                    ? "secondary"
                    : "outline"
              }
              size="sm"
            >
              {user.role}
            </Badge>
          </div>
        ))}
      </div>
    </section>
  );
}
