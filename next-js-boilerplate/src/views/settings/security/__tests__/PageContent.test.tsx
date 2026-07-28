import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SecurityPageContent from "../PageContent";

vi.mock("qrcode.react", () => ({ QRCodeSVG: () => null }));
vi.mock("@/components/ui/InputOTP", () => ({ InputOTP: () => null }));
vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => ({
    securityTwoFactor: "Two-Factor Authentication",
    securityTwoFactorEnabled: "Your account is protected",
    securityTwoFactorDisabled: "Add an extra layer of security",
    securitySetupTwoFactor: "Set up two-factor authentication",
    securityDisableTwoFactor: "Disable two-factor authentication",
    securityScanQrDescription: "Scan this QR code",
    securityManualEntryKey: "Or enter this key manually",
    securityContinue: "Continue",
    securityVerifyCodeTitle: "Verify code",
    securityVerifyCodeDescription: "Enter the code from your authenticator app",
    securityVerify: "Verify",
    securityRegenerateQr: "Generate new QR code",
    securityTwoFactorEnabledTitle: "Two-Factor Authentication Enabled",
    securitySaveBackupCodes: "Save these backup codes",
    securityConfirmCodesSaved: "I have saved my backup codes",
    securityDone: "Done",
    navSessions: "Sessions",
  }),
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
