import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormFieldInfo } from "./form-field-info";

const createFieldApi = (overrides: Record<string, unknown> = {}) => ({
  state: {
    meta: {
      errors: [] as string[],
      isValidating: false,
      ...overrides,
    },
  },
} as never);

describe("FormFieldInfo", () => {
  it("renders error message", () => {
    const field = createFieldApi({ errors: ["This field is required"] });
    render(<FormFieldInfo field={field} />);
    expect(screen.getByText("This field is required")).toBeDefined();
  });

  it("shows validating state with aria-live", () => {
    const field = createFieldApi({ isValidating: true });
    render(<FormFieldInfo field={field} />);
    const status = screen.getByRole("status");
    expect(status).toBeDefined();
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  it("renders nothing with no errors and not validating", () => {
    const field = createFieldApi();
    const { container } = render(<FormFieldInfo field={field} />);
    expect(container.firstChild).toBeNull();
  });
});
