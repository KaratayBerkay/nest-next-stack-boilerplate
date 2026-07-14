import type { Metadata } from "next";
import PageContent from "@/views/ui/file-upload/PageContent";

export const metadata: Metadata = {
  title: "File Upload",
  description: "File upload component demo",
};

export default function FileUploadPage() {
  return <PageContent />;
}
