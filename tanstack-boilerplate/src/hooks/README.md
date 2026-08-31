# hooks/

Cross-cutting React hooks not owned by a single feature. Examples: `useApi`, `useSSE`,
`useWebSocket`, `useAuth`, `useTheme`, `useDebounce`, `useMediaQuery`, `useBreakpoint`,
`useLocalStorage`, `useEdgeSwipe`, `useSwipeGesture`, `useMessaging`, `usePageNavigation`.

Feature-specific hooks live inside that feature (e.g. `features/auth/hooks/`).

All client hooks must be `"use client"`.
