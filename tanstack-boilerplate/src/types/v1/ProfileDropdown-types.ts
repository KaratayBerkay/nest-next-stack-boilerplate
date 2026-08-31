export interface ProfileDropdownProps {
  user: {
    name?: string;
    email: string;
    avatarUrl?: string;
    tier?: string;
  };
  logout: () => void;
  lang: string;
  align?: "left" | "right";
  children?: React.ReactNode;
}
