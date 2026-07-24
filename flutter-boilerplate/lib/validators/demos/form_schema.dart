String? validateName(String? value) {
  if (value == null || value.isEmpty) return 'Name is required';
  return null;
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex =
      RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateAge(String? value) {
  if (value == null || value.isEmpty) return 'Age is required';
  final age = int.tryParse(value);
  if (age == null) return 'Must be a number';
  if (age < 18) return 'Must be 18 or older';
  return null;
}
