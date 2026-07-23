String? validateMessage(String? value) {
  if (value == null || value.trim().isEmpty) return null;
  if (value.length > 5000) return 'Message is too long (max 5000 characters)';
  return null;
}

String? validateConversationTitle(String? value) {
  if (value == null || value.trim().isEmpty) return 'Title is required';
  if (value.length > 100) return 'Title is too long (max 100 characters)';
  return null;
}
