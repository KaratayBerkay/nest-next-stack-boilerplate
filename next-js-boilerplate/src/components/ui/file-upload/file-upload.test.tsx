import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileUpload } from "./file-upload";
import type { UploadFile } from "@/types/ui/FileUpload-types";

const toastMock = vi.fn();

vi.mock("@/components/ui/toast/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
}

function renderFileUpload(
  overrides: Partial<React.ComponentPropsWithoutRef<typeof FileUpload>> = {},
) {
  const files: UploadFile[] = [];
  const onFilesChange = vi.fn();
  const utils = render(
    <FileUpload files={files} onFilesChange={onFilesChange} {...overrides} />,
  );
  const fileInput = utils.container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  return { ...utils, onFilesChange, fileInput };
}

function triggerFileSelect(input: HTMLInputElement, files: File[]) {
  fireEvent.change(input, { target: { files } });
}

describe("FileUpload", () => {
  beforeEach(() => {
    toastMock.mockClear();
  });

  it("adds a valid file on selection", () => {
    const { onFilesChange, fileInput } = renderFileUpload();
    triggerFileSelect(fileInput, [
      createMockFile("test.txt", 100, "text/plain"),
    ]);
    expect(onFilesChange).toHaveBeenCalledOnce();
    const added = onFilesChange.mock.calls[0][0] as UploadFile[];
    expect(added).toHaveLength(1);
    expect(added[0].file.name).toBe("test.txt");
    expect(added[0].status).toBe("pending");
  });

  it("rejects file exceeding maxSizeBytes", () => {
    const { onFilesChange, fileInput } = renderFileUpload({
      maxSizeBytes: 200,
    });
    triggerFileSelect(fileInput, [
      createMockFile("large.txt", 500, "text/plain"),
    ]);
    expect(onFilesChange).toHaveBeenCalledOnce();
    const added = onFilesChange.mock.calls[0][0] as UploadFile[];
    expect(added).toHaveLength(1);
    expect(added[0].status).toBe("error");
    expect(added[0].error).toContain("too large");
  });

  it("rejects file with wrong MIME type and shows toast", () => {
    const { fileInput } = renderFileUpload({ accept: "image/png" });
    triggerFileSelect(fileInput, [
      createMockFile("doc.pdf", 100, "application/pdf"),
    ]);
    expect(toastMock).toHaveBeenCalledOnce();
    expect(toastMock.mock.calls[0][0].variant).toBe("destructive");
  });

  it("accepts file with wildcard MIME type", () => {
    const { onFilesChange, fileInput } = renderFileUpload({
      accept: "image/*",
    });
    triggerFileSelect(fileInput, [
      createMockFile("photo.jpg", 100, "image/jpeg"),
    ]);
    expect(onFilesChange).toHaveBeenCalledOnce();
    const added = onFilesChange.mock.calls[0][0] as UploadFile[];
    expect(added[0].status).toBe("pending");
  });

  it("respects maxFiles limit", () => {
    const { onFilesChange, fileInput } = renderFileUpload({
      maxFiles: 2,
    });
    triggerFileSelect(fileInput, [
      createMockFile("a.txt", 100, "text/plain"),
      createMockFile("b.txt", 100, "text/plain"),
      createMockFile("c.txt", 100, "text/plain"),
    ]);
    expect(onFilesChange).toHaveBeenCalledOnce();
    const added = onFilesChange.mock.calls[0][0] as UploadFile[];
    expect(added).toHaveLength(2);
  });

  it("renders existing files", () => {
    const existing: UploadFile[] = [
      {
        id: "f1",
        file: createMockFile("existing.txt", 50, "text/plain"),
        progress: 100,
        status: "done",
      },
    ];
    render(<FileUpload files={existing} onFilesChange={vi.fn()} />);
    expect(screen.getByText("existing.txt")).toBeTruthy();
    expect(screen.getByText("Uploaded")).toBeTruthy();
  });
});
