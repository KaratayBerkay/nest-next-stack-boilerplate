// UI-only mirror of the backend's DELETE_FOR_EVERYONE_WINDOW_MS
// (nest-js-boilerplate/src/messaging/messaging.types.ts) — used to gray out
// the "Delete for everyone" option once it would be rejected server-side.
// The server remains the sole enforcement authority; this only avoids
// offering an action that's guaranteed to fail.
export const DELETE_FOR_EVERYONE_WINDOW_MS = 15 * 60 * 1000;
