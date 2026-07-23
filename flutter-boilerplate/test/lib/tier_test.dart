import 'package:flutter_boilerplate/lib/tier.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Tier.hasAccess', () {
    test('free user has access to free tier', () {
      expect(Tier.hasAccess('free', 'free'), isTrue);
    });

    test('free user does not have access to basic tier', () {
      expect(Tier.hasAccess('free', 'basic'), isFalse);
    });

    test('free user does not have access to premium tier', () {
      expect(Tier.hasAccess('free', 'premium'), isFalse);
    });

    test('basic user has access to free and basic', () {
      expect(Tier.hasAccess('basic', 'free'), isTrue);
      expect(Tier.hasAccess('basic', 'basic'), isTrue);
    });

    test('basic user does not have access to premium', () {
      expect(Tier.hasAccess('basic', 'premium'), isFalse);
    });

    test('premium user has access to all tiers', () {
      expect(Tier.hasAccess('premium', 'free'), isTrue);
      expect(Tier.hasAccess('premium', 'basic'), isTrue);
      expect(Tier.hasAccess('premium', 'medium'), isTrue);
      expect(Tier.hasAccess('premium', 'premium'), isTrue);
    });

    test('unknown tier defaults to level 0', () {
      expect(Tier.hasAccess('unknown', 'free'), isTrue);
      expect(Tier.hasAccess('unknown', 'basic'), isFalse);
    });
  });

  group('Tier.displayName', () {
    test('returns Free for free tier', () {
      expect(Tier.displayName('free'), 'Free');
    });

    test('returns Basic for basic tier', () {
      expect(Tier.displayName('basic'), 'Basic');
    });

    test('returns Medium for medium tier', () {
      expect(Tier.displayName('medium'), 'Medium');
    });

    test('returns Premium for premium tier', () {
      expect(Tier.displayName('premium'), 'Premium');
    });

    test('defaults to Free for unknown tier', () {
      expect(Tier.displayName('unknown'), 'Free');
    });
  });
}
