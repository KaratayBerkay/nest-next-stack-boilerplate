# Share — Hooks

Page: [page.md](./page.md)

No custom hooks. All state (`title`, `content`, `file`, `preview`, `submitting`, `uploading`,
`error`, `uploadError`, plus two refs for the uploaded image URL and the file input element) lives as
plain `useState`/`useRef` directly inside
[`PageContent.tsx`](../../../../next-js-boilerplate/src/views/share/PageContent.tsx). The submit and
file-change logic is factored out into two plain exported functions in
[`share-actions.ts`](../../../../next-js-boilerplate/src/views/share/share-actions.ts)
(`handleFileChange`, `handleShareSubmit`) rather than a hook — see [page.md § Submit flow](./page.md#submit-flow)
for what they do, and [api.md](./api.md) for the two network calls `handleShareSubmit` makes.

## Cross-cutting hooks used here but not share-specific

`useMessages` — defined outside this vertical and shared across pages.
