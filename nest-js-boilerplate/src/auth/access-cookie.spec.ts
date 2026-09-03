import { accessCookieNameForEnv } from './access-cookie';

describe('accessCookieNameForEnv', () => {
  it('returns the plain dev name off production', () => {
    expect(accessCookieNameForEnv(false)).toBe('access_token');
  });

  it('returns the __Secure- prefixed name in production', () => {
    expect(accessCookieNameForEnv(true)).toBe('__Secure-access_token');
  });
});
