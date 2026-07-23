class FieldStatesValidator {
  static String? validateName(String? value) {
    if (value == null || value.isEmpty) return null;
    if (value.length < 2) return 'At least 2 characters';
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) return null;
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(value)) return 'Invalid email';
    return null;
  }

  static String? validateRole(String? value) {
    if (value == null || value.isEmpty) return 'Select a role';
    return null;
  }
}
