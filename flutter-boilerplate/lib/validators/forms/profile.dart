String? validateFirstName(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.isEmpty) return 'First name is required';
  return null;
}

String? validateLastName(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.isEmpty) return 'Last name is required';
  return null;
}

String? validateUsername(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length < 2) return 'Username must be at least 2 characters';
  if (value.length > 30) return 'Username must be at most 30 characters';
  return null;
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return null;
  final emailRegex =
      RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateBio(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length > 500) return 'Bio must be at most 500 characters';
  return null;
}
