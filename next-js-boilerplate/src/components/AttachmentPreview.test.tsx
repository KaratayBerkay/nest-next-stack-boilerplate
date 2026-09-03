import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttachmentPreview, serveUrl } from "@/components/AttachmentPreview";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

// CROSS-046: attachments that arrived over the WebSocket skipped DTO
// validation, so a peer could send a `url` that isn't a URL — `new URL(url)`
// then threw during render and took the whole conversation down with it.
describe("AttachmentPreview — malformed attachment urls", () => {
  it("serveUrl maps a real object url onto the serve endpoint", () => {
    expect(serveUrl("https://minio.local/bucket/report.pdf")).toBe(
      "/api/upload/serve?objectName=bucket%2Freport.pdf",
    );
  });

  it("serveUrl returns null instead of throwing for a non-URL", () => {
    expect(serveUrl("not a url")).toBeNull();
    expect(serveUrl("")).toBeNull();
    expect(serveUrl("https://minio.local/")).toBeNull();
  });

  it("serveUrl rejects non-http(s) schemes that parse but carry no object", () => {
    expect(serveUrl("javascript:alert(1)")).toBeNull();
    expect(serveUrl("data:text/html,hi")).toBeNull();
  });

  it("renders an inert chip (no button, no crash) when the url is unparseable", () => {
    render(<AttachmentPreview url="not a url" type="image/png" name="x.png" />);
    expect(screen.getByTestId("attachment-unavailable")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("x.png")).toBeTruthy();
  });

  it("ignores an unparseable thumbnail url but still renders the attachment", () => {
    render(
      <AttachmentPreview
        url="https://minio.local/bucket/a.png"
        type="image/png"
        name="a.png"
        thumbnailUrl="::not-a-url::"
      />,
    );
    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders the normal clickable tile for a valid url", () => {
    render(
      <AttachmentPreview
        url="https://minio.local/bucket/a.png"
        type="image/png"
        name="a.png"
      />,
    );
    expect(screen.getByRole("button")).toBeTruthy();
    expect(screen.queryByTestId("attachment-unavailable")).toBeNull();
  });
});
