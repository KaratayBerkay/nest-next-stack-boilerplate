// Global unit-test environment setup. ENCRYPTION_KEY and
// TOKEN_DERIVATION_SECRET are read directly (via process.env, not injected
// ConfigService) by the plain functions in common/id-codec and
// common/token-codec — encryptId/decryptId, encryptToken/decryptToken,
// hashForRedisKey. A spec that constructs a real AuthTokenService /
// SessionValidatorService / TokenStoreService / WireCryptoService with its
// OTHER dependencies mocked still hits these real functions, so they need a
// value here even though nothing else about the secret is exercised.
// Defensive ??= so a real .env-loaded value (if ever present) isn't
// clobbered.
process.env.ENCRYPTION_KEY ??= 'unit-test-encryption-key-not-for-real-use';
process.env.TOKEN_DERIVATION_SECRET ??=
  'unit-test-token-derivation-secret-not-for-real-use';
