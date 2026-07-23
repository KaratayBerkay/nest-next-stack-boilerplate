class BillingPlans {
  static const plans = [
    BillingPlan(name: 'Free', price: '\$0', period: 'forever', features: ['1 project', '1 GB storage']),
    BillingPlan(name: 'Basic', price: '\$9.99', period: 'mo', features: ['5 projects', '10 GB storage', 'Email support']),
    BillingPlan(name: 'Premium', price: '\$29.99', period: 'mo', features: ['Unlimited projects', '100 GB storage', 'Priority support']),
    BillingPlan(name: 'Enterprise', price: '\$99.99', period: 'mo', features: ['Unlimited everything', 'Dedicated support', 'SSO', 'Audit logs']),
  ];

  static const trialDays = 14;
  static const maxCouponLength = 20;
}

class BillingPlan {
  final String name;
  final String price;
  final String period;
  final List<String> features;

  const BillingPlan({
    required this.name,
    required this.price,
    required this.period,
    required this.features,
  });
}
