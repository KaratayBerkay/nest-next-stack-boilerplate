double calculateTax(double subtotal, double rate) {
  return subtotal * rate;
}

double calculateTotal(double subtotal, double tax, double? shipping) {
  final total = subtotal + tax;
  if (shipping != null) return total + shipping;
  return total;
}
