import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "../login-form";

const { loginMock, resendLoginCodeServerMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  resendLoginCodeServerMock: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    verifyMfa: vi.fn(),
    user: null,
    loading: false,
    mfaRequired: false,
  }),
}));

vi.mock("@/api/server/auth/mfa", () => ({
  resendLoginCodeServer: resendLoginCodeServerMock,
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
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
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        forgotPassword: "Forgot password?",
        submit: "Sign in",
        submitting: "Signing in...",
        noAccount: "No account?",
        registerLink: "Register",
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
  beforeEach(() => {
    loginMock.mockReset();
    resendLoginCodeServerMock.mockReset();
  });

  it("renders the login form", () => {
    render(<LoginForm />);
    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  it("disables resend during cooldown and re-enables once it elapses", async () => {
    vi.useFakeTimers();
    const user = {
      id: "u1",
      email: "alice@example.com",
      role: "USER",
      status: "ACTIVE",
    };
    loginMock.mockRejectedValueOnce(
      Object.assign(new Error("MFA required"), {
        mfaRequired: true,
        mfaToken: "token-1",
        mfaMethod: "EMAIL",
        user,
      }),
    );

    render(<LoginForm />);
    fireEvent.change(screen.getByTestId("login-email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByTestId("login-password"), {
      target: { value: "correct-horse-battery-staple" },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("login-submit"));
    });

    const resendButton = screen.getByText("Resend code");
    resendLoginCodeServerMock.mockResolvedValueOnce({ mfaToken: "token-2" });
    await act(async () => {
      fireEvent.click(resendButton);
    });

    expect(resendLoginCodeServerMock).toHaveBeenCalledWith("token-1");
    // Button wraps its label in an inner `display:contents` span (so
    // icon+label share the flex layout), so getByText resolves to that span,
    // not the <button> itself — walk up to the real element before checking
    // .disabled.
    const cooldownLabel = screen.getByText(/Resend in 60s/);
    const cooldownButton = cooldownLabel.closest("button");
    expect(cooldownButton?.disabled).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText("Resend code")).toBeTruthy();
    vi.useRealTimers();
  });
});
