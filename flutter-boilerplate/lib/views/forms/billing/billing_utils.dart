String formatCurrency(double amount, {String symbol = '\$'}) {
  return '$symbol${amount.toStringAsFixed(2)}';
}

String maskCardNumber(String number) {
  if (number.length < 8) return number;
  final last4 = number.substring(number.length - 4);
  return '•••• •••• •••• $last4';
}

String formatBillingDate(DateTime date) {
  final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}

double calculateTax(double subtotal, double taxRate) {
  return subtotal * taxRate;
}

double calculateTotal(double subtotal, double tax, double? discount) {
  final discounted = discount != null ? subtotal * (1 - discount) : subtotal;
  return discounted + tax;
}

String getPlanPrice(String planName) {
  switch (planName.toLowerCase()) {
    case 'free':
      return '\$0';
    case 'basic':
      return '\$9.99/mo';
    case 'premium':
      return '\$29.99/mo';
    case 'enterprise':
      return '\$99.99/mo';
    default:
      return '\$0';
  }
}
