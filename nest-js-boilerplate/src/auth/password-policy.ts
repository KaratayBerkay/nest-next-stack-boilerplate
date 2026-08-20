/**
 * Backend counterpart of the frontend's password-complexity checklist
 * (next-js-boilerplate `src/validators/auth/password-policy.ts`) — length is
 * already enforced per-field via @MinLength(8)/@MaxLength(128); this regex
 * adds the same lowercase/uppercase/number requirements shown to the user.
 */
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;
