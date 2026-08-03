/**
 * Symbol token and interface for the E2EE lifecycle hook.
 *
 * Injected (optionally) into auth-layer services so they can extend / delete
 * E2EE keys when sessions are touched or revoked — without creating a hard
 * module dependency from auth -> e2ee.
 */
export const E2EE_LIFECYCLE_HOOK = Symbol('E2EE_LIFECYCLE_HOOK');

export interface E2eeLifecycleHook {
  touchTTL(userId: string, deviceId: string | null): Promise<void>;
  deleteForSession(userId: string, deviceId: string | null): Promise<void>;
  deleteForUser(userId: string): Promise<void>;
}
