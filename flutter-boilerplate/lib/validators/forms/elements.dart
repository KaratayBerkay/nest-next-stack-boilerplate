class ElementsValidator {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) return null;
    final emailRegex =
        RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(value)) return 'Invalid email address';
    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) return 'Phone number is required';
    if (value.length < 6) return 'Phone number is required';
    return null;
  }

  static String? validateUrl(String? value) {
    if (value == null || value.isEmpty) return null;
    final uri = Uri.tryParse(value);
    if (uri == null || !uri.hasScheme || !uri.host.isNotEmpty) {
      return 'Enter a valid URL';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return null;
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  static String? validateBio(String? value) {
    if (value == null || value.isEmpty) return null;
    if (value.length > 200) return 'Bio must be 200 characters or fewer';
    return null;
  }
}
