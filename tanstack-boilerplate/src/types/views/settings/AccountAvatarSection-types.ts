import type { RefObject } from "react";

export interface AccountAvatarSectionProps {
  avatarUrl: string;
  name: string;
  email: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (file: File) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}
