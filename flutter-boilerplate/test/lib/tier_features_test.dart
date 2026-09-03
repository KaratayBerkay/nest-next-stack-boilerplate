import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/api/server/billing/plan_prices.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/tier_features.dart';
import 'package:flutter_test/flutter_test.dart';

// CROSS-031: the feature list comes from the backend, the words from ARB.
void main() {
  late AppLocalizations t;

  setUpAll(() async {
    t = await AppLocalizations.delegate.load(const Locale('en'));
  });

  test('translates known keys and interpolates values', () {
    expect(
      tierFeatureLabel(t, const TierFeature(key: 'basicAccess')),
      'Basic access',
    );
    expect(
      tierFeatureLabel(
        t,
        const TierFeature(key: 'everythingIn', value: 'BASIC'),
      ),
      'Everything in Basic',
    );
    expect(
      tierFeatureLabel(t, const TierFeature(key: 'callMinutes', value: '45')),
      'Calls up to 45 min',
    );
  });

  test('never drops an unknown key from a newer backend', () {
    expect(tierFeatureLabel(t, const TierFeature(key: 'teleport')), 'teleport');
    expect(
      tierFeatureLabel(t, const TierFeature(key: 'teleport', value: '3')),
      'teleport: 3',
    );
  });

  test('prefers the live backend list and falls back per tier', () {
    final prices = [
      const PlanPrice(
        tier: 'FREE',
        priceCents: 0,
        currency: 'USD',
        features: [
          TierFeature(key: 'basicAccess'),
          TierFeature(key: 'callMinutes', value: '10'),
        ],
      ),
      const PlanPrice(tier: 'BASIC', priceCents: 999, currency: 'USD'),
    ];
    expect(
      featuresForTier(t, 'free', prices),
      ['Basic access', 'Calls up to 10 min'],
    );
    // BASIC came back with no list → placeholder keys, still translated.
    expect(featuresForTier(t, 'basic', prices).first, 'Everything in Free');
    expect(featuresForTier(t, 'premium', null), contains('Crown badge'));
  });
}
