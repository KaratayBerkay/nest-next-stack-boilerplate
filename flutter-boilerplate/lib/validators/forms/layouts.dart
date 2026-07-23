String? validateFullName(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length < 2) return 'Name must be at least 2 characters';
  return null;
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return null;
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length < 6) return 'Password must be at least 6 characters';
  return null;
}

String? validateConfirmPassword(String? password, String? confirm) {
  if (confirm == null || confirm.isEmpty) return null;
  if (password != confirm) return 'Passwords must match';
  return null;
}

String? validateFirstName(String? value) {
  if (value == null || value.isEmpty) return 'First name is required';
  if (value.length < 2) return 'First name is required';
  return null;
}

String? validateLastName(String? value) {
  if (value == null || value.isEmpty) return 'Last name is required';
  if (value.length < 2) return 'Last name is required';
  return null;
}

String? validatePhone(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length < 6) return 'Phone is required';
  return null;
}

String? validateName(String? value) {
  if (value == null || value.isEmpty) return 'Name is required';
  if (value.length < 2) return 'Name is required';
  return null;
}

String? validateMail(String? value) {
  if (value == null || value.isEmpty) return null;
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateLock(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length < 6) return 'Password must be at least 6 characters';
  return null;
}

String? validateStreet(String? value) {
  if (value == null || value.isEmpty) return 'Street is required';
  if (value.length < 3) return 'Street is required';
  return null;
}

String? validateCity(String? value) {
  if (value == null || value.isEmpty) return 'City is required';
  if (value.length < 2) return 'City is required';
  return null;
}

String? validateState(String? value) {
  if (value == null || value.isEmpty) return 'State is required';
  if (value.length < 2) return 'State is required';
  return null;
}

String? validateZip(String? value) {
  if (value == null || value.isEmpty) return 'ZIP code is required';
  if (value.length < 3) return 'ZIP code is required';
  return null;
}

String? validateCountry(String? value) {
  if (value == null || value.isEmpty) return 'Country is required';
  return null;
}

String? validatePlan(String? value) {
  if (value == null || value.isEmpty) return null;
  if (!['free', 'basic', 'premium'].contains(value)) return 'Invalid plan';
  return null;
}

String? validateAgree(bool? value) {
  if (value != true) return 'You must agree to the terms';
  return null;
}
