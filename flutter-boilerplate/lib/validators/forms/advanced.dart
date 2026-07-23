String? validateFullName(String? value) {
  if (value == null || value.isEmpty) return 'Name is required';
  if (value.length < 2) return 'At least 2 characters';
  return null;
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) return 'Password is required';
  if (value.length < 8) return 'At least 8 characters';
  return null;
}

String? validateCompanyName(String? value) {
  if (value == null || value.isEmpty) return 'Company name is required';
  return null;
}

String? validateTaxId(String? value) {
  if (value == null || value.isEmpty) return null;
  final taxRegex = RegExp(r'^[A-Z]{2}\d{2,13}[A-Z0-9]$');
  if (!taxRegex.hasMatch(value)) return 'Invalid tax ID format';
  return null;
}

String? validateIndustry(String? value) {
  if (value == null || value.isEmpty) return 'Select an industry';
  return null;
}

String? validateMemberName(String? value) {
  if (value == null || value.isEmpty) return 'Name is required';
  return null;
}

String? validateMemberEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateRole(String? value) {
  if (value == null || value.isEmpty) return 'Select a role';
  return null;
}
