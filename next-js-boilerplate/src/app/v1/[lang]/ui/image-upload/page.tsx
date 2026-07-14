import type { Metadata } from "next";
import PageContent from "@/views/ui/image-upload/PageContent";

export const metadata: Metadata = {
  title: "Image Upload",
  description: "Image upload component demo",
};

export default function ImageUploadPage() {
  return <PageContent />;
}
