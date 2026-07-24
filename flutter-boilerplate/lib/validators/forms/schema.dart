String? validateRequired(String? value, [String field = 'This field']) {
  if (value == null || value.trim().isEmpty) return '$field is required';
  return null;
}

String? validateMinLength(
  String? value,
  int min, [
  String field = 'This field',
]) {
  if (value != null && value.length < min) {
    return '$field must be at least $min characters';
  }
  return null;
}

String? validateMaxLength(
  String? value,
  int max, [
  String field = 'This field',
]) {
  if (value != null && value.length > max) {
    return '$field must be at most $max characters';
  }
  return null;
}

String? validateUrl(String? value) {
  if (value == null || value.isEmpty) return null;
  final uri = Uri.tryParse(value);
  if (uri == null || !uri.hasScheme) return 'Invalid URL';
  return null;
}

String? validateNumber(String? value) {
  if (value == null || value.isEmpty) return null;
  if (double.tryParse(value) == null) return 'Must be a number';
  return null;
}

String? validatePhone(String? value) {
  if (value == null || value.isEmpty) return null;
  final phoneRegex = RegExp(r'^\+?[\d\s\-()]{7,15}$');
  if (!phoneRegex.hasMatch(value)) return 'Invalid phone number';
  return null;
}
