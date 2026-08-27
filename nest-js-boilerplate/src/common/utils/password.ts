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

// Length and character-variety are already enforced by the DTO layer's
// @MinLength(8)/@Matches(PASSWORD_COMPLEXITY_REGEX) decorators (global
// ValidationPipe runs before this is ever called) — this only adds the one
// check the DTO can't express: rejecting common/breached passwords.
export function validatePasswordStrength(password: string): void {
  if (COMMON_PASSWORDS.has(password.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
    throw new BadRequestException({
      exc: 'EX_AUTH_WEAK_PASSWORD',
      msg: 'Password is too common, choose a more unique one',
      key: 'auth.errors.passwordTooCommon',
    });
  }
}
