import 'free_page_view.dart';

/// Mirrors the web's `export const PremiumPageView = FreePageView` —
/// messaging has no tier differentiation in the source of truth
/// (`PremiumPageView.tsx`).
typedef PremiumMessagesPage = FreeMessagesPage;
