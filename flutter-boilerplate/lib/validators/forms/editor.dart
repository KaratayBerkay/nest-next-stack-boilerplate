class EditorValidator {
  static String? validateTitle(String? value) {
    if (value == null || value.isEmpty) return 'Title required';
    return null;
  }

  static String? validateSlug(String? value) {
    if (value == null || value.isEmpty) return null;
    final slugRegex = RegExp(r'^[a-z0-9-]+$');
    if (!slugRegex.hasMatch(value)) return 'Invalid slug';
    return null;
  }
}
