import type { RefObject } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { initials } from "@/lib/initials";

interface AccountAvatarSectionProps {
  avatarUrl: string;
  name: string;
  email: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

export function AccountAvatarSection({
  avatarUrl,
  name,
  email,
  fileInputRef,
  onFileSelect,
  t,
}: AccountAvatarSectionProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={avatarUrl}
        fallback={initials(name || email)}
        size="xl"
        className="bg-brand text-brand-fg"
      />
      <div className="flex flex-col gap-2">
        <Button
          variant="link"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {t.avatarChange}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
    </div>
  );
}
