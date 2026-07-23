String? validateCardholderName(String? value) {
  if (value == null || value.isEmpty) return 'Cardholder name is required';
  return null;
}

String? validateBillingAddress(String? value) {
  if (value == null || value.isEmpty) return 'Address is required';
  return null;
}

String? validateCity(String? value) {
  if (value == null || value.isEmpty) return 'City is required';
  return null;
}

String? validatePostalCode(String? value) {
  if (value == null || value.isEmpty) return 'Postal code is required';
  if (value.length < 4) return 'Invalid postal code';
  return null;
}

String? validateCountry(String? value) {
  if (value == null || value.isEmpty) return 'Country is required';
  return null;
}

String? validateCouponCode(String? value) {
  if (value != null && value.isNotEmpty && value.length < 3) return 'Invalid coupon code';
  return null;
}
