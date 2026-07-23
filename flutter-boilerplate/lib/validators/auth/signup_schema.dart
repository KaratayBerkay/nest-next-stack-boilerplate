String? validateSignupName(String? value) {
  if (value == null || value.isEmpty) return 'Name is required';
  return null;
}

String? validateSignupEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateSignupPassword(String? value) {
  if (value == null || value.isEmpty) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

String? validateConfirmPassword(String? password, String? confirm) {
  if (confirm == null || confirm.isEmpty) return 'Please confirm your password';
  if (password != confirm) return 'Passwords do not match';
  return null;
}
