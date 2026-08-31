# PlanSummaryCard (widget)

**Source:** [`plan_summary_card.dart`](../../../../../flutter-boilerplate/lib/views/checkout/plan_summary_card.dart)
**Used in:** [checkout screen](../screen.md)
**Web equivalent:** [PlanSummaryCard component](../../../../frontend/v1/checkout/components/plan-summary-card.md)

## Purpose

`StatelessWidget` recap card: tier name, price (or "already on this plan"), optional feature bullets.
Purely presentational, no state, no API call.

## Constructor

```dart
class PlanSummaryCard extends StatelessWidget {
  final String tierLabel;
  final String price;
  final List<String> features;   // default const []
  final bool alreadySubscribed;
}
```

## ⚠ `features` is a built, working, but permanently-unused parameter

The widget's own `build()` correctly renders a checkmark-bulleted list when `features.isNotEmpty` —
but its **one and only call site**
([`page_content.dart`](../../../../../flutter-boilerplate/lib/views/checkout/page_content.dart))
constructs it as `PlanSummaryCard(tierLabel: ..., price: ..., alreadySubscribed: ...)`, never passing
`features` at all, so it silently defaults to `[]` and that whole rendering branch never executes in
the live app. Confirmed via `grep -rn "PlanSummaryCard("` across the entire Flutter app: exactly one
call site, and it doesn't pass this parameter. Contrast web's equivalent
[`PlanSummaryCard.tsx`](../../../../frontend/v1/checkout/components/plan-summary-card.md), which
*does* show a feature list (sourced from its own hardcoded `TIER_FEATURES`, see
[CROSS-031](../../../../issues.md#cross-031)) — this is a minor, cosmetic-only parity gap: web's
checkout recap shows features, mobile's doesn't, despite the widget being fully capable of it. See
`MOB-018` (resolved).

## Calls

None — pure presentational widget, receives everything as constructor params.
