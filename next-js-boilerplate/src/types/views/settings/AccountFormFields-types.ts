import type { Dispatch, SetStateAction } from "react";

export interface AccountFormFieldsProps {
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
