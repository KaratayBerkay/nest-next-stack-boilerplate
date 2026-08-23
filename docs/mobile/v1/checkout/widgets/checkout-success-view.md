# CheckoutSuccessView (widget)

**Source:** [`checkout_success_view.dart`](../../../../../flutter-boilerplate/lib/views/checkout/checkout_success_view.dart)
**Used in:** [checkout screen](../screen.md)
**Web equivalent:** [CheckoutSuccessView component](../../../../frontend/v1/checkout/components/checkout-success-view.md)

## Purpose

Terminal success state, shown in place of the form once a submit succeeds — icon (check for
upgrade/change, down-arrow for cancel) + message + "redirecting…" line. `StatelessWidget`, no state,
no API call. Field-for-field equivalent of the web component of the same name.

## Constructor

```dart
class CheckoutSuccessView extends StatelessWidget {
  final bool isDowngrade;
  final String? message;
  final String downgradeMsg;
  final String upgradeMsg;
  final String redirectingMsg;
}
```

Same `message ?? (isDowngrade ? downgradeMsg : upgradeMsg)` fallback logic as web — and the same
observation applies: the screen's one call site always supplies a real `message`
(`t.checkoutChangeScheduled(...)` for a scheduled change, `null` otherwise, in which case the
`isDowngrade` ternary picks between `downgradeMsg`/`upgradeMsg` correctly) so the fallback path is
exercised for the immediate/cancel cases specifically, not dead — a small difference from web's
version, where `buildSuccessMessage` always returns a non-null string and the fallback there is
closer to truly unreachable. Not worth a separate finding, just noted for accuracy.

## Calls

None — purely presentational. The redirect timer (`Future.delayed` → `context.go(...)`) lives in the
parent screen's `_redirectAfter`, not here.
