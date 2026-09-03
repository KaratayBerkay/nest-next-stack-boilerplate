import 'reflect-metadata';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from './notification.module';

type ImportEntry = unknown;

function isForwardRef(m: unknown): m is { forwardRef: () => unknown } {
  return typeof m === 'object' && m !== null && 'forwardRef' in m;
}

/**
 * Walk `imports` metadata depth-first from `root`, recording every module whose
 * imports array contains an `undefined` entry. That is exactly what a hard
 * file-level module cycle produces: the module that closes the cycle is
 * decorated while the other side is still mid-load, so its class is
 * `undefined` at decoration time and Nest aborts boot with "The module at
 * index [n] of the X imports array is undefined". forwardRef() edges and
 * dynamic-module objects are cycle-safe and skipped.
 */
function findUndefinedImports(
  root: unknown,
  seen = new Set<unknown>(),
  broken: string[] = [],
): string[] {
  if (typeof root !== 'function' || seen.has(root)) return broken;
  seen.add(root);
  const imports =
    (Reflect.getMetadata('imports', root) as ImportEntry[] | undefined) ?? [];
  imports.forEach((m, i) => {
    if (m === undefined) broken.push(`${root.name}.imports[${i}]`);
    else if (!isForwardRef(m) && typeof m === 'function')
      findUndefinedImports(m, seen, broken);
  });
  return broken;
}

// Regression for the 2026-09-03 production boot crash: AuthModule ->
// forwardRef(NotificationModule) -> PushNotificationModule -> AuthModule was a
// hard cycle. Unit tests never build the real module graph, so this walks the
// decorator metadata instead — cheap, no infra, and it fails the same way the
// process would.
describe('auth / notification module graph', () => {
  it('has no undefined import entries reachable from AuthModule or NotificationModule', () => {
    const broken = [
      ...findUndefinedImports(AuthModule),
      ...findUndefinedImports(NotificationModule),
    ];
    expect(broken).toEqual([]);
  });
});
