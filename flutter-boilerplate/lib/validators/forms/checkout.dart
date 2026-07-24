String? validateStreet(String? value) {
  if (value == null || value.isEmpty) return 'Street required';
  return null;
}

String? validateCity(String? value) {
  if (value == null || value.isEmpty) return 'City required';
  return null;
}

String? validateProvince(String? value) {
  if (value == null || value.isEmpty) return 'Province required';
  return null;
}

String? validatePostalCode(String? value) {
  if (value == null || value.isEmpty) return 'Postal code required';
  if (value.length < 3) return 'Invalid postal code';
  return null;
}

String? validateCountry(String? value) {
  if (value == null || value.isEmpty) return 'Country required';
  return null;
}

String? validatePhone(String? value) {
  if (value == null || value.isEmpty) return null;
  final phoneRegex = RegExp(r'^\+?[0-9()\-.\s]{7,20}$');
  if (!phoneRegex.hasMatch(value.trim())) return 'Invalid phone number';
  return null;
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex =
      RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateConfirmEmail(String? emailValue, String? confirmValue) {
  if (confirmValue == null || confirmValue.isEmpty) return 'Email is required';
  final emailRegex =
      RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(confirmValue)) return 'Invalid email';
  return null;
}

String? validatePaymentMethod(String? value) {
  if (value == null || value.isEmpty) return 'Payment method required';
  return null;
}
