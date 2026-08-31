// Compat shim for the `server-only` marker package.
// Under Next.js, importing `server-only` from client code is a build error.
// Under TanStack Start the server/client split is enforced by the compiler
// (server function bodies and server route handlers are stripped from the
// client bundle), so this marker is intentionally inert.
export {};
