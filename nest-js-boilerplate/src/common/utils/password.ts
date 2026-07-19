import { BadRequestException } from '@nestjs/common';

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'abc123',
  '11111111',
  'password1',
  'passw0rd',
  'admin123',
  'test1234',
]);

export function validatePasswordStrength(password: string): void {
  if (password.length < 8) {
    throw new BadRequestException({
      exc: 'EX_AUTH_WEAK_PASSWORD',
      msg: 'Password must be at least 8 characters',
      key: 'auth.errors.passwordTooShort',
    });
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
    throw new BadRequestException({
      exc: 'EX_AUTH_WEAK_PASSWORD',
      msg: 'Password is too common, choose a more unique one',
      key: 'auth.errors.passwordTooCommon',
    });
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
    Boolean,
  ).length;

  if (variety < 3) {
    throw new BadRequestException({
      exc: 'EX_AUTH_WEAK_PASSWORD',
      msg: 'Password must include at least 3 of: lowercase, uppercase, digit, special character',
      key: 'auth.errors.passwordNeedsVariety',
    });
  }
}
