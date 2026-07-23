import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'use_auth.dart';

final useMinTierProvider = Provider.family<bool, String>((ref, minTier) {
  final tier = ref.watch(userTierProvider);
  const tiers = ['free', 'basic', 'medium', 'premium'];
  final userIdx = tiers.indexOf(tier);
  final minIdx = tiers.indexOf(minTier);
  return userIdx >= minIdx;
});
