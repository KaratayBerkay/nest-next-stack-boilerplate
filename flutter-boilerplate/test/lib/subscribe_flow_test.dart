import 'package:flutter_boilerplate/lib/billing/subscribe_flow.dart';
import 'package:flutter_test/flutter_test.dart';

// BE-019: Stripe 3DS recovery on first subscribe.
void main() {
  test('a plain success passes straight through', () async {
    var confirmed = 0;
    final result = await completeSubscribeWithAuthentication(
      {'success': true, 'periodEnd': 'x'},
      confirm: (_) async => confirmed++,
      finalize: (_) async => throw StateError('must not finalize'),
    );
    expect(result['success'], isTrue);
    expect(confirmed, 0);
  });

  test('confirms the PaymentIntent, then finalizes the subscription', () async {
    final confirmedSecrets = <String>[];
    final finalized = <String>[];
    final result = await completeSubscribeWithAuthentication(
      {
        'success': false,
        'reason': 'authentication_required',
        'clientSecret': 'pi_1_secret_x',
        'stripeSubscriptionId': 'sub_1',
      },
      confirm: (s) async => confirmedSecrets.add(s),
      finalize: (id) async {
        finalized.add(id);
        return {'success': true};
      },
    );
    expect(confirmedSecrets, ['pi_1_secret_x']);
    expect(finalized, ['sub_1']);
    expect(result['success'], isTrue);
  });

  test('a declined result throws SubscribeDeclined with the backend reason',
      () async {
    expect(
      () => completeSubscribeWithAuthentication(
        {'success': false, 'reason': 'insufficient_funds'},
        confirm: (_) async {},
        finalize: (_) async => {'success': true},
      ),
      throwsA(
        isA<SubscribeDeclined>()
            .having((e) => e.reason, 'reason', 'insufficient_funds'),
      ),
    );
  });

  test('a missing success flag is a decline, never a silent success', () async {
    // Regression: the page used to treat any non-throwing subscribe() as
    // success, so a declined card showed "Upgrade successful!".
    expect(
      () => completeSubscribeWithAuthentication(
        <String, dynamic>{},
        confirm: (_) async {},
        finalize: (_) async => {'success': true},
      ),
      throwsA(isA<SubscribeDeclined>()),
    );
  });

  test('gives up when Stripe keeps asking for authentication', () async {
    final pending = {
      'success': false,
      'reason': 'authentication_required',
      'clientSecret': 'pi_1_secret_x',
      'stripeSubscriptionId': 'sub_1',
    };
    var finalizeCalls = 0;
    await expectLater(
      () => completeSubscribeWithAuthentication(
        pending,
        confirm: (_) async {},
        finalize: (_) async {
          finalizeCalls++;
          return pending;
        },
      ),
      throwsA(
        isA<SubscribeDeclined>()
            .having((e) => e.reason, 'reason', 'authentication_failed'),
      ),
    );
    // Two rounds, then it stops instead of looping on the bank forever.
    expect(finalizeCalls, 2);
  });
}
