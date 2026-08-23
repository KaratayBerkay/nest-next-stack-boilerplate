# Share — Hooks

Screen: [screen.md](./screen.md)

No custom hooks/providers of its own. All state (`_titleCtrl`, `_contentCtrl`, `_submitting`,
`_pickedFilePath`, `_uploadedImageUrl`, `_uploadStatus`, `_errorMessage`) is plain `State` on
`_SharePageContentState` — see [screen.md § Submit flow](./screen.md#submit-flow) for the
`_pickImage`/`_submit`/`_clearImage`/`_retryUpload` methods that own it.

## Cross-cutting providers used here but not share-specific

`postActionsProvider` (`create`, `uploadImage`) and `paginatedFeedProvider` (invalidated on
success) — both defined in [feed/hooks.md](../feed/hooks.md)/[feed/api.md](../feed/api.md), which
this screen reuses without its own wrapper.
