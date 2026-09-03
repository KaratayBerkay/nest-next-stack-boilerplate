/// BE-019: Stripe 3DS/SCA recovery for a first subscription.
///
/// The backend answers `subscribeToPlan` with `reason: authentication_required`
/// plus the first invoice's PaymentIntent `clientSecret` when the bank wants
/// the customer to authenticate. The flow is: run the next action on-device
/// (`Stripe.instance.handleNextAction`), then ask the backend to
/// `finalizeSubscription` — it re-reads the subscription from Stripe and
/// provisions the tier once it is active. Pure orchestration so it is
/// testable without the Stripe SDK.
class SubscribeDeclined implements Exception {
  final String reason;
  const SubscribeDeclined(this.reason);

  @override
  String toString() => 'SubscribeDeclined($reason)';
}

Future<Map<String, dynamic>> completeSubscribeWithAuthentication(
  Map<String, dynamic> initial, {
  required Future<void> Function(String clientSecret) confirm,
  required Future<Map<String, dynamic>> Function(String stripeSubscriptionId)
      finalize,
  int maxRounds = 2,
}) async {
  var result = initial;
  for (var round = 0; round < maxRounds; round++) {
    if (result['success'] == true) return result;
    final reason = result['reason'] as String?;
    final clientSecret = result['clientSecret'] as String?;
    final subscriptionId = result['stripeSubscriptionId'] as String?;
    if (reason != 'authentication_required' ||
        clientSecret == null ||
        subscriptionId == null) {
      throw SubscribeDeclined(reason ?? 'declined');
    }
    await confirm(clientSecret);
    result = await finalize(subscriptionId);
  }
  if (result['success'] == true) return result;
  throw const SubscribeDeclined('authentication_failed');
}
