export interface ErrorScenario {
  id: string;
  status: number;
  exc: string;
  key: string;
  msg: string;
  field?: string;
  fields?: Array<{ field: string; msg: string; key: string }>;
}

export const ERROR_SCENARIOS: ErrorScenario[] = [
  {
    id: "validation-form-field",
    status: 400,
    exc: "EX_VALIDATION_FORM",
    key: "forms.errors.postalCodeInvalid",
    msg: "Postal code is invalid for the selected country",
    field: "postalCode",
  },
  {
    id: "auth-email-taken",
    status: 409,
    exc: "EX_AUTH_EMAIL_TAKEN",
    key: "auth.errors.emailTaken",
    msg: "Email is already registered",
    field: "email",
  },
  {
    id: "conflict-duplicate",
    status: 409,
    exc: "EX_CONFLICT_DUPLICATE",
    key: "forms.errors.couponExpired",
    msg: "This coupon has expired",
  },
  {
    id: "tier-insufficient",
    status: 403,
    exc: "EX_TIER_INSUFFICIENT",
    key: "forms.errors.inviteQuotaExceeded",
    msg: "Invite quota exceeded — upgrade your plan",
  },
  {
    id: "not-found",
    status: 404,
    exc: "EX_NOT_FOUND",
    key: "error.notFound",
    msg: "Resource not found",
  },
  {
    id: "forbidden",
    status: 403,
    exc: "EX_FORBIDDEN",
    key: "error.forbidden",
    msg: "Access denied",
  },
  {
    id: "unstable-connection",
    status: 503,
    exc: "EX_WS_UNSTABLE",
    key: "forms.errors.connectionUnstable",
    msg: "Connection is unstable — check your network",
  },
  {
    id: "internal-error",
    status: 500,
    exc: "EX_INTERNAL",
    key: "forms.errors.scanFailed",
    msg: "Virus scan failed — this file may be unsafe",
    field: "file",
  },
  {
    id: "real-unmapped-toast",
    status: 409,
    exc: "EX_API_KEY_NAME_EXISTS",
    key: "apiKeys.errors.nameExists",
    msg: 'An API key named "X" already exists',
  },
  {
    id: "real-unmapped-field",
    status: 409,
    exc: "EX_PROFILE_USERNAME_TAKEN",
    key: "settings.errors.usernameTaken",
    msg: "Username is already taken",
    field: "username",
  },
  {
    id: "invite-email-member",
    status: 409,
    exc: "EX_CONFLICT_DUPLICATE",
    key: "forms.errors.emailAlreadyMember",
    msg: "This email is already a member",
    field: "emails.2",
  },
  {
    id: "invite-quota",
    status: 403,
    exc: "EX_TIER_INSUFFICIENT",
    key: "forms.errors.inviteQuotaExceeded",
    msg: "Invite quota exceeded — upgrade your plan",
  },
  {
    id: "coupon-invalid",
    status: 400,
    exc: "EX_VALIDATION_FORM",
    key: "forms.errors.couponInvalid",
    msg: "Invalid coupon code",
    field: "couponCode",
  },
  {
    id: "coupon-expired",
    status: 409,
    exc: "EX_CONFLICT_DUPLICATE",
    key: "forms.errors.couponExpired",
    msg: "This coupon has expired",
  },
  {
    id: "payment-declined",
    status: 402,
    exc: "EX_CONFLICT_DUPLICATE",
    key: "forms.errors.paymentDeclined",
    msg: "Payment was declined",
  },
  {
    id: "postal-code-group",
    status: 400,
    exc: "EX_VALIDATION_FORM",
    key: "forms.errors.postalCodeInvalid",
    msg: "Postal code doesn't match the selected country",
    field: "billingAddress.postalCode",
  },
  {
    id: "row-rejected",
    status: 422,
    exc: "EX_VALIDATION_FORM",
    key: "forms.errors.rowRejected",
    msg: "This row was rejected by the server",
    field: "rows.3.quantity",
  },
];
