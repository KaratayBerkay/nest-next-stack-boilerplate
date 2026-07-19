import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormLevelError } from "./form-level-error";

function createMockForm() {
  let errorMap = { onSubmit: undefined as unknown };
  return {
    Subscribe: ({ selector, children }: { selector: (state: { errorMap: typeof errorMap }) => unknown; children: (error: unknown) => React.ReactNode }) => {
      const val = selector({ errorMap });
      return <>{children(val)}</>;
    },
    setErrorMap: vi.fn((m: { onSubmit: undefined }) => {
      errorMap = { ...errorMap, ...m };
    }),
  };
}

describe("FormLevelError", () => {
  it("renders nothing when there is no onSubmit error", () => {
    const form = createMockForm();
    const { container } = render(<FormLevelError form={form} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error banner with role='alert' when onSubmit error exists", () => {
    const form = createMockForm();
    form.Subscribe = function Subscribe({ selector, children }: { selector: (state: { errorMap: { onSubmit: string } }) => unknown; children: (error: unknown) => React.ReactNode }) {
      return <>{children(selector({ errorMap: { onSubmit: "Server error" } }))}</>;
    };
    render(<FormLevelError form={form} />);
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Server error")).toBeDefined();
  });

  it("calls setErrorMap when dismiss is clicked", () => {
    const form = createMockForm();
    form.Subscribe = function Subscribe({ selector, children }: { selector: (state: { errorMap: { onSubmit: string } }) => unknown; children: (error: unknown) => React.ReactNode }) {
      return <>{children(selector({ errorMap: { onSubmit: "Error" } }))}</>;
    };
    render(<FormLevelError form={form} />);
    screen.getByLabelText("Dismiss").click();
    expect(form.setErrorMap).toHaveBeenCalledWith({ onSubmit: undefined });
  });
});
