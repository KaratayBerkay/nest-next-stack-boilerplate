String? validatePlan(String? value) {
  if (value == null || value.isEmpty) return 'Plan is required';
  return null;
}

String? validateBillingPeriod(String? value) {
  if (value == null || value.isEmpty) return 'Billing period is required';
  if (!['monthly', 'yearly'].contains(value)) return 'Invalid billing period';
  return null;
}

String? validatePaymentMethod(String? value) {
  if (value == null || value.isEmpty) return 'Payment method is required';
  return null;
}

String? validateCouponCode(String? value) {
  return null;
}
