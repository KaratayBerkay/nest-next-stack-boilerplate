import FormsLayout from "@/views/forms/FormsLayout";
import type { FormsLayoutProps } from "@/types/forms/FormsLayout-types";

export default function Layout({ children }: FormsLayoutProps) {
  return <FormsLayout>{children}</FormsLayout>;
}
