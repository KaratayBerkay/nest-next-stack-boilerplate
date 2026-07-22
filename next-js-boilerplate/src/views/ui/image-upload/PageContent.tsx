"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { ProfileFormTab } from "@/views/ui/image-upload/ProfileFormTab";
import { AvatarTab } from "@/views/ui/image-upload/AvatarTab";
import { GalleryTab } from "@/views/ui/image-upload/GalleryTab";
import { CoverPhotoTab } from "@/views/ui/image-upload/CoverPhotoTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "profile-form",
    title: "Profile Form",
    description:
      "Avatar upload composed with name fields and a save action — a real profile-editing block.",
    render: () => <ProfileFormTab />,
  },
  {
    id: "avatar",
    title: "Avatar",
    description:
      "Circular preview with a change overlay on hover. Replace-on-click for single image.",
    render: () => <AvatarTab />,
  },
  {
    id: "gallery",
    title: "Gallery Grid",
    description:
      "Multi-image upload displayed in a 2-column (3 on sm+) grid. Hover reveals file name and remove button.",
    render: () => <GalleryTab />,
  },
  {
    id: "cover",
    title: "Cover Photo",
    description:
      "Single image with a 16:9 aspect ratio, suitable for banners or cover photos.",
    render: () => <CoverPhotoTab />,
  },
];

export default function ImageUploadPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Image Upload"
      intro="An image-focused uploader built on FileUpload with thumbnail previews, multiple layout modes, and avatar support."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
