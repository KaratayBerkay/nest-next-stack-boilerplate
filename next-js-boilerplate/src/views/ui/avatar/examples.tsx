import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { ComponentsTab } from "@/views/ui/avatar/ComponentsTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const teamMembers = [
  {
    name: "Alex Chen",
    email: "alex.chen@example.com",
    role: "Admin" as const,
    initials: "AC",
    img: "https://i.pravatar.cc/80?img=12",
    status: "online" as const,
  },
  {
    name: "Sarah Kim",
    email: "sarah.kim@example.com",
    role: "Editor" as const,
    initials: "SK",
    img: "https://i.pravatar.cc/80?img=13",
    status: "online" as const,
  },
  {
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    role: "Viewer" as const,
    initials: "MJ",
    img: "",
    status: "away" as const,
  },
  {
    name: "Priya Patel",
    email: "priya.p@example.com",
    role: "Editor" as const,
    initials: "PP",
    img: "https://i.pravatar.cc/80?img=15",
    status: "offline" as const,
  },
];

const roleBadgeVariant = {
  Admin: "default",
  Editor: "soft",
  Viewer: "secondary",
} as const;

const statusColor = {
  online: "bg-success",
  away: "bg-warning",
  offline: "bg-border",
} as const;

export const avatarExamples: UIExample[] = [
  {
    id: "usage",
    title: "Avatar Examples",
    description: "Avatar with sizes, images, fallbacks, and groups.",
    render: () => <ComponentsTab />,
  },
  {
    id: "team",
    title: "Team Members",
    description: "Team roster with avatars, roles, and status indicators.",
    render: () => (
      <div className="surface divide-border border-border flex flex-col divide-y rounded-lg border">
        {teamMembers.map((member) => (
          <div key={member.name} className="flex items-center gap-3 px-4 py-3">
            <div className="relative">
              <Avatar
                src={member.img || undefined}
                alt={member.name}
                fallback={member.initials}
                size="md"
              />
              <span
                className={`border-surface absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 ${statusColor[member.status]}`}
              />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-muted text-xs">{member.email}</p>
              </div>
              <Badge variant={roleBadgeVariant[member.role]}>
                {member.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Avatar component across all theme variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "secondary", "outline"]}
        sizes={["sm", "md", "lg", "xl"]}
        render={(variant, size) => (
          <Avatar
            src="https://i.pravatar.cc/80?img=8"
            alt="User"
            fallback="XX"
            size={size as "sm" | "md" | "lg" | "xl"}
            data-variant={variant}
          />
        )}
      />
    ),
  },
];
