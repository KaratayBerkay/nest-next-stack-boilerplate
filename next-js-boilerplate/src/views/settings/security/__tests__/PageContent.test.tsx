import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SecurityPageContent from "../PageContent";

const enrollMfaServerMock = vi.fn();
const verifyMfaEnrollmentServerMock = vi.fn();
const disableMfaServerMock = vi.fn();

vi.mock("@/api/server/auth/mfa", () => ({
  enrollMfaServer: () => enrollMfaServerMock(),
  verifyMfaEnrollmentServer: (code: string) =>
    verifyMfaEnrollmentServerMock(code),
  disableMfaServer: (code: string) => disableMfaServerMock(code),
}));

vi.mock("qrcode.react", () => ({ QRCodeSVG: () => null }));
// Real InputOTP so tests can actually type a code and observe it reset —
// a null stub couldn't exercise the verifyCode-reset regression this file
// covers.
vi.mock("@/components/ui/InputOTP", () => ({
  InputOTP: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <input
      aria-label="otp-code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));
// Button/IconButton render through useComponentVariant, which needs a
// ThemeProvider this unit test doesn't set up — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));
// SecurityChangePassword (always rendered by SecurityPageContent) calls
// useToast, which needs a <ToastProvider> this unit test doesn't set up.
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: (page: string) => {
    if (page === "auth") {
      return {
        errors: {
          currentPasswordRequired: "Current password is required",
          passwordRequired: "Password is required",
          passwordMin: "Password must be at least 8 characters",
          passwordMax: "Password must be at most 100 characters",
          passwordsMustMatch: "Passwords must match",
          passwordLowercase: "Password must contain a lowercase letter",
          passwordUppercase: "Password must contain an uppercase letter",
          passwordNumber: "Password must contain a number",
        },
        passwordRules: {
          heading: "Password must contain",
          length: "At least 8 characters",
          lowercase: "A lowercase letter",
          uppercase: "An uppercase letter",
          number: "A number",
        },
      };
    }
    return {
      securityHeading: "Security Settings",
      securityTwoFactor: "Two-Factor Authentication",
      securityTwoFactorEnabled: "Your account is protected",
      securityTwoFactorDisabled: "Add an extra layer of security",
      securitySetupTwoFactor: "Set up two-factor authentication",
      securityDisableTwoFactor: "Disable two-factor authentication",
      securityScanQrDescription: "Scan this QR code",
      securityManualEntryKey: "Or enter this key manually",
      securityContinue: "Continue",
      securityVerifyCodeTitle: "Verify code",
      securityVerifyCodeDescription:
        "Enter the code from your authenticator app",
      securityVerify: "Verify",
      securityRegenerateQr: "Generate new QR code",
      securityTwoFactorEnabledTitle: "Two-Factor Authentication Enabled",
      securitySaveBackupCodes: "Save these backup codes",
      securityConfirmCodesSaved: "I have saved my backup codes",
      securityDone: "Done",
      navSessions: "Sessions",
    };
  },
}));

describe("SecurityPageContent", () => {
  it("renders MFA setup button when MFA is disabled", () => {
    render(<SecurityPageContent initialMfaEnabled={false} lang="en" />);
    expect(screen.getByText("Set up two-factor authentication")).toBeTruthy();
    expect(screen.getByText("Add an extra layer of security")).toBeTruthy();
  });

  it("renders disable button when MFA is enabled", () => {
    render(<SecurityPageContent initialMfaEnabled={true} lang="en" />);
    expect(screen.getByText("Disable two-factor authentication")).toBeTruthy();
    expect(screen.getByText("Your account is protected")).toBeTruthy();
  });

  it("renders sessions link", () => {
    render(<SecurityPageContent initialMfaEnabled={false} lang="en" />);
    const link = screen.getByText("Sessions");
    expect(link).toBeTruthy();
    expect(link.closest("a")?.getAttribute("href")).toBe(
      "/v1/en/settings/sessions",
    );
  });
});

describe("SecurityPageContent MFA wizard resets", () => {
  beforeEach(() => {
    enrollMfaServerMock.mockReset();
    verifyMfaEnrollmentServerMock.mockReset();
    disableMfaServerMock.mockReset();
  });

  it("clears a typed verify code when Regenerate QR issues a new secret", async () => {
    enrollMfaServerMock.mockResolvedValue({
      otpauthUrl: "otpauth://totp/first",
      secret: "FIRSTSECRET",
    });

    render(<SecurityPageContent initialMfaEnabled={false} lang="en" />);
    fireEvent.click(screen.getByText("Set up two-factor authentication"));
    await waitFor(() => expect(enrollMfaServerMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Continue"));

    const otpInput = screen.getByLabelText("otp-code") as HTMLInputElement;
    fireEvent.change(otpInput, { target: { value: "123456" } });
    expect(otpInput.value).toBe("123456");

    enrollMfaServerMock.mockResolvedValue({
      otpauthUrl: "otpauth://totp/second",
      secret: "SECONDSECRET",
    });
    fireEvent.click(screen.getByText("Generate new QR code"));
    await waitFor(() => expect(enrollMfaServerMock).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByText("Continue"));

    expect((screen.getByLabelText("otp-code") as HTMLInputElement).value).toBe(
      "",
    );
  });

  it("does not start a fresh enrollment with the previous cycle's backup-codes checkbox pre-checked", async () => {
    enrollMfaServerMock.mockResolvedValue({
      otpauthUrl: "otpauth://totp/first",
      secret: "FIRSTSECRET",
    });
    verifyMfaEnrollmentServerMock.mockResolvedValue({
      backupCodes: ["aaaa-1111", "bbbb-2222"],
    });
    disableMfaServerMock.mockResolvedValue({ success: true });

    render(<SecurityPageContent initialMfaEnabled={false} lang="en" />);

    // Enroll, verify, and reach the backup-codes screen.
    fireEvent.click(screen.getByText("Set up two-factor authentication"));
    await waitFor(() => expect(enrollMfaServerMock).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.change(screen.getByLabelText("otp-code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Verify"));
    await waitFor(() =>
      expect(screen.getByText("I have saved my backup codes")).toBeTruthy(),
    );

    // Check the acknowledgment box and finish.
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByText("Done"));
    await waitFor(() =>
      expect(
        screen.getByText("Disable two-factor authentication"),
      ).toBeTruthy(),
    );

    // Disable, then start a brand-new enrollment.
    fireEvent.click(screen.getByText("Disable two-factor authentication"));
    fireEvent.change(screen.getByLabelText("otp-code"), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByText("Disable two-factor authentication"));
    await waitFor(() => expect(disableMfaServerMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText("Set up two-factor authentication")).toBeTruthy(),
    );

    fireEvent.click(screen.getByText("Set up two-factor authentication"));
    await waitFor(() => expect(enrollMfaServerMock).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.change(screen.getByLabelText("otp-code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Verify"));
    await waitFor(() =>
      expect(screen.getByText("I have saved my backup codes")).toBeTruthy(),
    );

    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(
      false,
    );
  });
});
