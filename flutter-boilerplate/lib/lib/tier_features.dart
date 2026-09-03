import 'package:flutter_boilerplate/api/server/billing/plan_prices.dart';
import 'package:flutter_boilerplate/l10n/app_localizations.dart';
import 'package:flutter_boilerplate/lib/tier.dart';

/// CROSS-031: tier feature copy.
///
/// The *list* of what each tier includes comes from the backend
/// (`planPrices { features { key value } }`), so it can never drift from the
/// web apps or from the limits the backend actually enforces. This file owns
/// only the translation of each key. [kFallbackTierFeatures] mirrors the
/// backend keys and is used purely as the placeholder before the query
/// resolves (same role as the web's legacy `featuresX` arrays).
const Map<String, List<TierFeature>> kFallbackTierFeatures = {
  Tier.free: [
    TierFeature(key: 'basicAccess'),
    TierFeature(key: 'communitySupport'),
  ],
  Tier.basic: [
    TierFeature(key: 'everythingIn', value: 'FREE'),
    TierFeature(key: 'prioritySupport'),
    TierFeature(key: 'basicAnalytics'),
  ],
  Tier.medium: [
    TierFeature(key: 'everythingIn', value: 'BASIC'),
    TierFeature(key: 'postStats'),
    TierFeature(key: 'vipRooms'),
    TierFeature(key: 'suggestedFriends'),
  ],
  Tier.premium: [
    TierFeature(key: 'everythingIn', value: 'MEDIUM'),
    TierFeature(key: 'whoReacted'),
    TierFeature(key: 'exportData'),
    TierFeature(key: 'crownBadge'),
    TierFeature(key: 'dedicatedSupport'),
  ],
};

String _tierName(String raw) {
  final lower = raw.toLowerCase();
  if (lower.isEmpty) return raw;
  return lower[0].toUpperCase() + lower.substring(1);
}

/// Translate one backend feature descriptor. Unknown keys (a backend newer
/// than this build) fall back to the raw key so nothing silently disappears.
String tierFeatureLabel(AppLocalizations t, TierFeature feature) {
  switch (feature.key) {
    case 'basicAccess':
      return t.pricingFeatureBasicAccess;
    case 'communitySupport':
      return t.pricingFeatureCommunitySupport;
    case 'everythingIn':
      return t.pricingFeatureEverythingIn(_tierName(feature.value ?? ''));
    case 'prioritySupport':
      return t.pricingFeaturePrioritySupport;
    case 'basicAnalytics':
      return t.pricingFeatureBasicAnalytics;
    case 'postStats':
      return t.pricingFeaturePostStats;
    case 'vipRooms':
      return t.pricingFeatureVipRooms;
    case 'suggestedFriends':
      return t.pricingFeatureSuggestedFriends;
    case 'whoReacted':
      return t.pricingFeatureWhoReacted;
    case 'exportData':
      return t.pricingFeatureExportData;
    case 'crownBadge':
      return t.pricingFeatureCrownBadge;
    case 'dedicatedSupport':
      return t.pricingFeatureDedicatedSupport;
    case 'callMinutes':
      return t.pricingFeatureCallMinutes(feature.value ?? '');
    case 'storageMultiplier':
      return t.pricingFeatureStorageMultiplier(feature.value ?? '');
    default:
      return feature.value == null
          ? feature.key
          : '${feature.key}: ${feature.value}';
  }
}

/// Localized feature lines for [tier] ('free'/'basic'/...), from the live
/// [prices] when they carry a list, else from the placeholder set.
List<String> featuresForTier(
  AppLocalizations t,
  String tier,
  List<PlanPrice>? prices,
) {
  final lower = tier.toLowerCase();
  final live = prices
      ?.where((p) => p.tier.toLowerCase() == lower && p.features.isNotEmpty)
      .firstOrNull;
  final source = live?.features ?? kFallbackTierFeatures[lower] ?? const [];
  return source.map((f) => tierFeatureLabel(t, f)).toList();
}
