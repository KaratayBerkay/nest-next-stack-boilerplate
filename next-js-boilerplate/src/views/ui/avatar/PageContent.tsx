"use client";

import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const teamMembers = [
  { name: "Alex Chen", email: "alex.chen@example.com", role: "Admin" as const, initials: "AC", img: "https://i.pravatar.cc/80?img=12", status: "online" as const },
  { name: "Sarah Kim", email: "sarah.kim@example.com", role: "Editor" as const, initials: "SK", img: "https://i.pravatar.cc/80?img=13", status: "online" as const },
  { name: "Marcus Johnson", email: "marcus.j@example.com", role: "Viewer" as const, initials: "MJ", img: "", status: "away" as const },
  { name: "Priya Patel", email: "priya.p@example.com", role: "Editor" as const, initials: "PP", img: "https://i.pravatar.cc/80?img=15", status: "offline" as const },
];

const roleBadgeVariant = { Admin: "default", Editor: "soft", Viewer: "secondary" } as const;

const statusColor = { online: "bg-success", away: "bg-warning", offline: "bg-border" } as const;

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src="https://i.pravatar.cc/80?img=1"
            alt="User"
            fallback="JD"
            size="sm"
            data-testid="avatar-sm"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=1"
            alt="User"
            fallback="JD"
            size="md"
            data-testid="avatar-md"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=1"
            alt="User"
            fallback="JD"
            size="lg"
            data-testid="avatar-lg"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=1"
            alt="User"
            fallback="JD"
            size="xl"
            data-testid="avatar-xl"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Image</h3>
        <div className="flex items-center gap-4">
          <Avatar
            src="https://i.pravatar.cc/80?img=2"
            alt="User"
            fallback="AB"
            size="md"
            data-testid="avatar-with-image"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Fallback Only</h3>
        <div className="flex items-center gap-4">
          <Avatar fallback="CN" size="md" data-testid="avatar-fallback" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Avatar Group</h3>
        <AvatarGroup data-testid="avatar-group">
          <Avatar
            src="https://i.pravatar.cc/80?img=3"
            alt="User"
            fallback="AL"
            size="md"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=4"
            alt="User"
            fallback="BM"
            size="md"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=5"
            alt="User"
            fallback="CK"
            size="md"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=6"
            alt="User"
            fallback="DJ"
            size="md"
          />
          <Avatar
            src="https://i.pravatar.cc/80?img=7"
            alt="User"
            fallback="ER"
            size="md"
          />
        </AvatarGroup>
      </section>
    </div>
  );
}

function ExamplesTab() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Team Members</h3>
      <div className="flex flex-col gap-3">
        {[
          {
            name: "Alice Johnson",
            role: "Designer",
            img: "https://i.pravatar.cc/80?img=9",
          },
          {
            name: "Bob Martinez",
            role: "Developer",
            img: "https://i.pravatar.cc/80?img=10",
          },
          {
            name: "Carol Smith",
            role: "Product Manager",
            img: "https://i.pravatar.cc/80?img=11",
          },
        ].map((member) => (
          <div
            key={member.name}
            className="surface flex items-center gap-3 px-3 py-2"
          >
            <Avatar
              src={member.img}
              alt={member.name}
              fallback={member.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
              size="md"
            />
            <div>
              <p className="text-sm font-medium">{member.name}</p>
              <p className="text-muted text-xs">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const examples: UIExample[] = [
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
      <div className="surface flex flex-col divide-y divide-border rounded-lg border border-border">
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
                className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-surface ${statusColor[member.status]}`}
              />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-muted text-xs">{member.email}</p>
              </div>
              <Badge variant={roleBadgeVariant[member.role]}>{member.role}</Badge>
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

export default function AvatarPage() {
  return (
    <ExampleTabs
      title="Avatar"
      intro="An image element with a fallback for representing the user."
      examples={examples}
    />
  );
}
