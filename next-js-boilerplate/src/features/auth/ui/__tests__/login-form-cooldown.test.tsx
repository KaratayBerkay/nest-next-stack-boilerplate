import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "../login-form";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    verifyMfa: vi.fn(),
    user: null,
    loading: false,
    mfaRequired: false,
  }),
}));

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    form: {
      login: {
        title: "Sign In",
        mfaTitle: "Two-Factor Authentication",
        mfaCodeLabel: "Authentication code",
        mfaVerify: "Verify",
        mfaVerifying: "Verifying...",
        mfaResendCode: "Resend code",
        mfaResendCooldown: "Resend in",
        mfaResending: "Sending...",
        trustDevice: "Trust this device",
        useDifferentAccount: "Use a different account",
        mfaEmailDescription: "Enter the code sent to {email}",
        mfaTotpDescription:
          "Enter the code from your authenticator app for {email}",
      },
    },
    errors: {
      emailRequired: "Email is required",
      emailInvalid: "Invalid email address",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 8 characters",
      passwordMax: "Password must be at most 128 characters",
      loginFailed: "Invalid credentials",
    },
    loading: "Loading...",
    signedInAs: "Signed in as {email}",
    role: "Role:",
    status: "Status:",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("LoginForm", () => {
  it("renders the login form", () => {
    render(<LoginForm />);
    expect(screen.getByText("Sign In")).toBeTruthy();
  });
});
