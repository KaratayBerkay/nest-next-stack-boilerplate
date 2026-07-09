import type { ReactNode } from "react";
import type { User } from "@/features/auth/hooks/useAuth";

export interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}
