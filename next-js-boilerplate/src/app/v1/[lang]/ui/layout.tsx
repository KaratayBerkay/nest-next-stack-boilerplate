import UILayout from "@/views/ui/UILayout";
import type { UILayoutProps } from "@/types/ui/UILayout-types";

export default function Layout({ children }: UILayoutProps) {
  return <UILayout>{children}</UILayout>;
}
