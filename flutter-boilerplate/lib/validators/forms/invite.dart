String? validateEmail(String? value) {
  if (value == null || value.isEmpty) return null;
  final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
  if (!emailRegex.hasMatch(value)) return 'Invalid email';
  return null;
}

String? validateRole(String? value) {
  if (value == null || value.isEmpty) return 'Select a role';
  if (!['member', 'admin', 'owner'].contains(value)) return 'Invalid role';
  return null;
}

String? validateMessage(String? value) {
  if (value == null || value.isEmpty) return null;
  if (value.length > 1000) return 'Message must be at most 1000 characters';
  return null;
}
