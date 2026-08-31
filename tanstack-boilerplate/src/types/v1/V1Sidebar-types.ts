import type { User } from "@/hooks/useAuth";

export interface V1SidebarProps {
  sidebarOpen: boolean;
  user: User | null;
  logout: () => void;
  lang: string;
  onNav: () => void;
}
