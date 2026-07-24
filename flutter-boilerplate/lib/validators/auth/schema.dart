class LoginFormData {
  final String email;
  final String password;

  const LoginFormData({required this.email, required this.password});
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex =
      RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email format';
  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

String? validateName(String? value) {
  if (value == null || value.isEmpty) return 'Name is required';
  if (value.length < 2) return 'Name must be at least 2 characters';
  return null;
}
