import { encryptId, decryptId } from './id-codec';
import { getUuidFieldSets } from './uuid-fields';

function transformLeaf(value: unknown, fn: (s: string) => string): unknown {
  if (typeof value === 'string') return fn(value);
  if (Array.isArray(value)) {
    // Array.isArray narrows to any[] regardless of the input's static type
    // (a standard-lib typing quirk) — re-widen to unknown[] so the ternary
    // below doesn't silently leak `any` back out through the map.
    const items = value as unknown[];
    return items.map((item) => (typeof item === 'string' ? fn(item) : item));
  }
  return value;
}

function walk(
  value: unknown,
  safeNames: Set<string>,
  fn: (s: string) => string,
): unknown {
  if (value === null || value === undefined || value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => walk(v, safeNames, fn));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = safeNames.has(k) ? transformLeaf(v, fn) : walk(v, safeNames, fn);
    }
    return out;
  }
  return value;
}

/**
 * Recursively decrypts every value keyed by a known uuid field name, at any
 * nesting depth. Used for INPUT everywhere (GraphQL args, REST
 * body/params/query, WS inbound messages) — a client can hand over
 * arbitrarily nested structures in one shot (`data: { connect: { id } }`,
 * `where: { AND: [{ authorId }] } }`), so unlike GraphQL's output side there's
 * no framework recursion to lean on; this has to walk the whole tree itself.
 * Throws on a malformed/tampered token — callers must catch and turn that
 * into a clean client-facing error.
 */
export function deepDecryptIds(value: unknown): unknown {
  const { globalSafeNames } = getUuidFieldSets();
  return walk(value, globalSafeNames, decryptId);
}

/**
 * Same as {@link deepDecryptIds}, but swallows a per-leaf decrypt failure
 * instead of throwing — the leaf is left as-is rather than aborting the
 * whole walk. Used only where a hard failure isn't safe to throw from (the
 * Express `query parser` hook — see main.ts — runs inside a getter that can
 * be invoked from unpredictably many call sites per request, so throwing
 * there risks crashing unrelated code instead of cleanly 400ing the
 * request). A malformed/tampered value just fails to match anything
 * downstream (e.g. a bad pagination cursor resolves no row, same as an
 * empty one) rather than being rejected outright.
 */
export function bestEffortDecryptIds(value: unknown): unknown {
  const { globalSafeNames } = getUuidFieldSets();
  return walk(value, globalSafeNames, (s) => {
    try {
      return decryptId(s);
    } catch {
      return s;
    }
  });
}

/**
 * Recursively encrypts every value keyed by a known uuid field name, at any
 * nesting depth. Used for REST responses and WS outbound frames, which arrive
 * as one already-assembled object with no framework recursion to lean on
 * (unlike GraphQL's per-field resolution — see {@link encryptFieldIfId}).
 */
export function deepEncryptIds(value: unknown): unknown {
  const { globalSafeNames } = getUuidFieldSets();
  return walk(value, globalSafeNames, encryptId);
}

/**
 * Shallow, single-field GraphQL output transform: encrypts `value` if
 * `fieldName` is a known uuid field.
 *
 * Two-tier lookup: when `typeName` matches a real Prisma model, use that
 * model's precise field set — this is what correctly includes
 * `RoomParticipant.roomId` while excluding `RoomMessage.roomId` (a slug, not
 * a uuid), a distinction only per-model context can make. But plenty of
 * GraphQL types are hand-written, not Prisma models — `SessionUserPayload`
 * (the `me` query's return type, deliberately separate from the generated
 * `User` type), `Conversation`, `NotificationsPage`, and others — and for
 * those `fieldsByModel.get(typeName)` is undefined. Falling through to
 * `value` unencrypted there was a real bug (`me { id }` shipped the raw
 * database uuid — caught live, see
 * id-encryption-transport-boundary-2026-08-19 memory), not a theoretical
 * edge case. Falling back to the flat global set (same one REST/WS use) for
 * any type that isn't a recognized Prisma model fixes that class of gap —
 * accepting the same conservative `roomId`-must-be-named-differently-to-
 * qualify trade-off already made for REST/WS.
 */
export function encryptFieldIfId(
  typeName: string,
  fieldName: string,
  value: unknown,
): unknown {
  const { fieldsByModel, globalSafeNames } = getUuidFieldSets();
  const modelFields = fieldsByModel.get(typeName);
  const qualifies = modelFields
    ? modelFields.has(fieldName)
    : globalSafeNames.has(fieldName);
  if (!qualifies) return value;
  return transformLeaf(value, encryptId);
}
