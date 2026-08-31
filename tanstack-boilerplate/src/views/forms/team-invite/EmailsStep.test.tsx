import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { validateEmail } from "./EmailsStep";
import { NavigationButtons } from "./NavigationButtons";

vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));

const t = {
  next: "Next",
  back: "Back",
  emailInvalid: "EMAIL_INVALID",
  emailDuplicate: "EMAIL_DUPLICATE",
  emailAlreadyMember: "EMAIL_ALREADY_MEMBER",
};

describe("validateEmail", () => {
  it("returns null (no error) for a blank value", () => {
    expect(validateEmail("", [], t)).toBeNull();
    expect(validateEmail("   ", [], t)).toBeNull();
  });

  it("flags a malformed address", () => {
    expect(validateEmail("not-an-email", [], t)).toBe("EMAIL_INVALID");
  });

  it("flags a duplicate already in the list", () => {
    expect(validateEmail("a@b.com", ["a@b.com"], t)).toBe("EMAIL_DUPLICATE");
  });

  it("accepts a valid, new address", () => {
    expect(validateEmail("new@b.com", ["a@b.com"], t)).toBeNull();
  });
});

function makeForm(overrides: { emailInput: string; emails: string[] }) {
  return {
    state: {
      values: { emailInput: overrides.emailInput, emails: overrides.emails },
    },
    pushFieldValue: vi.fn(),
    setFieldValue: vi.fn(),
  };
}

describe("NavigationButtons Next: committing a pending emailInput", () => {
  it("commits a valid pending address instead of silently dropping it when advancing", () => {
    const form = makeForm({ emailInput: "new@b.com", emails: [] });
    const setStep = vi.fn();
    const setEmailInputError = vi.fn();

    render(
      <NavigationButtons
        step={0}
        setStep={setStep}
        canNext={true}
        setEmailInputError={setEmailInputError}
        t={t}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form={form as any}
      />,
    );

    fireEvent.click(screen.getByText("Next"));

    expect(form.pushFieldValue).toHaveBeenCalledWith("emails", "new@b.com");
    expect(form.setFieldValue).toHaveBeenCalledWith("emailInput", "");
    expect(setStep).toHaveBeenCalled();
  });

  it("blocks advancing and surfaces the error for an invalid pending address", () => {
    const form = makeForm({ emailInput: "not-an-email", emails: [] });
    const setStep = vi.fn();
    const setEmailInputError = vi.fn();

    render(
      <NavigationButtons
        step={0}
        setStep={setStep}
        canNext={true}
        setEmailInputError={setEmailInputError}
        t={t}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form={form as any}
      />,
    );

    fireEvent.click(screen.getByText("Next"));

    expect(setEmailInputError).toHaveBeenCalledWith("EMAIL_INVALID");
    expect(form.pushFieldValue).not.toHaveBeenCalled();
    expect(setStep).not.toHaveBeenCalled();
  });

  it("advances normally when there is nothing pending to commit", () => {
    const form = makeForm({ emailInput: "", emails: ["a@b.com"] });
    const setStep = vi.fn();
    const setEmailInputError = vi.fn();

    render(
      <NavigationButtons
        step={0}
        setStep={setStep}
        canNext={true}
        setEmailInputError={setEmailInputError}
        t={t}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form={form as any}
      />,
    );

    fireEvent.click(screen.getByText("Next"));

    expect(form.pushFieldValue).not.toHaveBeenCalled();
    expect(setStep).toHaveBeenCalled();
  });
});
