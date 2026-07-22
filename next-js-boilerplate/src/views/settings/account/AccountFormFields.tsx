import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

interface AccountFormFieldsProps {
  name: string;
  onNameChange: Dispatch<SetStateAction<string>>;
  username: string;
  onUsernameChange: Dispatch<SetStateAction<string>>;
  bio: string;
  onBioChange: Dispatch<SetStateAction<string>>;
  availability: "idle" | "checking" | "available" | "taken";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

export function AccountFormFields({
  name,
  onNameChange,
  username,
  onUsernameChange,
  bio,
  onBioChange,
  availability,
  t,
}: AccountFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>{t.name}</Label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t.username}</Label>
        <Input
          value={username}
          onChange={(e) =>
            onUsernameChange(
              e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            )
          }
        />
        {availability === "checking" && (
          <span className="text-muted text-xs">{t.usernameChecking}</span>
        )}
        {availability === "available" && (
          <span className="text-xs text-green-600">
            {t.usernameAvailable}
          </span>
        )}
        {availability === "taken" && (
          <span className="text-xs text-red-600">{t.usernameTaken}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t.bio}</Label>
        <Textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
