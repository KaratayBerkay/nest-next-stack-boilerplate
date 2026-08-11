import PagesLayout from "@/views/pages/PagesLayout";
import type { PagesLayoutProps } from "@/types/pages/PagesLayout-types";

export default function Layout({ children }: PagesLayoutProps) {
  return <PagesLayout>{children}</PagesLayout>;
}
