import '../../../validators/forms/schema.dart' as forms;

String? validateBio(String? value) {
  if (value == null || value.isEmpty) return null;
  return forms.validateMaxLength(value, 500, 'Bio');
}

String? validateName(String? value) {
  return forms.validateRequired(value, 'Name');
}

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return 'Email is required';
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email format';
  return null;
}

String? validateUrl(String? value) {
  return forms.validateUrl(value);
}
