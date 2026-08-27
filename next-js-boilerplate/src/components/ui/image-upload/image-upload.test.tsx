import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ImageUpload } from "./image-upload";
import type { UploadFile } from "@/types/ui/FileUpload-types";

vi.mock("@/components/ui/toast/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

function makeFile(overrides: Partial<UploadFile> = {}): UploadFile {
  return {
    id: "avatar",
    file: new File(["x"], "avatar.png", { type: "image/png" }),
    progress: 50,
    status: "pending",
    preview: "blob:mock-preview",
    ...overrides,
  };
}

describe("ImageUpload (avatar mode) upload status visibility", () => {
  it("shows an uploading indicator while the avatar is uploading, not just the local preview", () => {
    render(
      <ImageUpload
        avatar
        value={[makeFile({ status: "uploading" })]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("shows a translated failure message when the avatar upload fails", () => {
    render(
      <ImageUpload
        avatar
        value={[makeFile({ status: "error" })]}
        onChange={vi.fn()}
        labels={{ uploadFailed: "UPLOAD_FAILED_LABEL" }}
      />,
    );

    expect(screen.getByText("UPLOAD_FAILED_LABEL")).toBeTruthy();
  });

  it("shows no status indicator or error once the upload has succeeded", () => {
    render(
      <ImageUpload
        avatar
        value={[makeFile({ status: "done" })]}
        onChange={vi.fn()}
        labels={{ uploadFailed: "UPLOAD_FAILED_LABEL" }}
      />,
    );

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("UPLOAD_FAILED_LABEL")).toBeNull();
  });
});

describe("ImageUpload (gallery mode) preview rendering", () => {
  it("renders each file once, not once as a generic list row and again as a grid thumbnail", () => {
    render(
      <ImageUpload
        multiple
        value={[makeFile({ id: "f1" })]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("avatar.png")).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "Remove avatar.png" }),
    ).toHaveLength(1);
  });
});
