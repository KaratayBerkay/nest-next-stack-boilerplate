import 'package:flutter_boilerplate/api/server/billing/subscription.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SubscriptionInfo.fromJson', () {
    test('parses tier from tier field', () {
      final json = {
        'tier': 'BASIC',
        'periodEnd': '2024-12-31T00:00:00.000Z',
        'cancelAtPeriodEnd': false,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.plan, 'basic');
    });

    test('falls back to plan field when tier is absent', () {
      final json = {
        'plan': 'PREMIUM',
        'periodEnd': '2024-12-31T00:00:00.000Z',
        'cancelAtPeriodEnd': false,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.plan, 'premium');
    });

    test('sets status to canceling when cancelAtPeriodEnd is true', () {
      final json = {
        'tier': 'basic',
        'periodEnd': '2024-12-31T00:00:00.000Z',
        'cancelAtPeriodEnd': true,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.status, 'canceling');
      expect(info.cancelAtPeriodEnd, isTrue);
    });

    test('sets status to active when not canceling', () {
      final json = {
        'tier': 'basic',
        'periodEnd': '2024-12-31T00:00:00.000Z',
        'cancelAtPeriodEnd': false,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.status, 'active');
      expect(info.cancelAtPeriodEnd, isFalse);
    });

    test('parses periodEnd as DateTime', () {
      final json = {
        'tier': 'basic',
        'periodEnd': '2024-12-31T00:00:00.000Z',
        'cancelAtPeriodEnd': false,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.currentPeriodEnd, isNotNull);
      expect(info.currentPeriodEnd!.year, 2024);
      expect(info.currentPeriodEnd!.month, 12);
      expect(info.currentPeriodEnd!.day, 31);
    });

    test('handles null periodEnd', () {
      final json = {
        'tier': 'free',
        'periodEnd': null,
        'cancelAtPeriodEnd': false,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.currentPeriodEnd, isNull);
    });

    test('defaults to free plan when no tier or plan field', () {
      final json = {
        'cancelAtPeriodEnd': false,
      };
      final info = SubscriptionInfo.fromJson(json);
      expect(info.plan, 'free');
    });
  });
}
