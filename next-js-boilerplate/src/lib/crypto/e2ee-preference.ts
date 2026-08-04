/**
 * Bridges the current user's `e2eeEnabled` preference into non-React code
 * (react-query queryFns, WS frame handlers) that can't call useAuth().
 * Kept in sync by AuthProvider whenever `user` changes — see useAuth.tsx.
 *
 * Deliberately a standalone module (no imports) rather than living in
 * query.ts alongside its sibling _ownUserId bridge: chat.ts needs to read
 * this, and query.ts already imports decrypt helpers from chat.ts, so
 * putting it there would create a chat.ts <-> query.ts import cycle.
 */

let _e2eeEnabled = true;

export function setE2eeEnabled(v: boolean): void {
  _e2eeEnabled = v;
}

export function getE2eeEnabled(): boolean {
  return _e2eeEnabled;
}
