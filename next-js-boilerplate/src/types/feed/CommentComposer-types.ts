import type { Dispatch, FormEvent, SetStateAction } from "react";

export interface CommentComposerProps {
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
  replyTo: string | null;
  setReplyTo: Dispatch<SetStateAction<string | null>>;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
}
