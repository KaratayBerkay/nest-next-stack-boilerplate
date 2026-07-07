import { Suspense } from "react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";

async function Content() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Avatar</h2>
      <p className="text-muted text-sm">
        An image element with a fallback for representing the user.
      </p>

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

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <Content />
    </Suspense>
  );
}
