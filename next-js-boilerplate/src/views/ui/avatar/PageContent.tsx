"use client";

import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

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
    id: "components",
    title: "Broken Image Fallback",
    description: "Avatar with bad src falls back to initials.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Team Stack",
    description: "AvatarGroup with max count and +N overflow.",
    render: () => <ExamplesTab />,
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
