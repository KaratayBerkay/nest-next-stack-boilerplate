class Tier {
  Tier._();

  static const String free = 'free';
  static const String basic = 'basic';
  static const String medium = 'medium';
  static const String premium = 'premium';

  static const List<String> all = [free, basic, medium, premium];

  static const tierOrder = {
    free: 0,
    basic: 1,
    medium: 2,
    premium: 3,
  };

  static bool hasAccess(String userTier, String requiredTier) {
    final userLevel = tierOrder[userTier] ?? 0;
    final requiredLevel = tierOrder[requiredTier] ?? 0;
    return userLevel >= requiredLevel;
  }

  static String displayName(String tier) {
    switch (tier) {
      case free:
        return 'Free';
      case basic:
        return 'Basic';
      case medium:
        return 'Medium';
      case premium:
        return 'Premium';
      default:
        return 'Free';
    }
  }
}
