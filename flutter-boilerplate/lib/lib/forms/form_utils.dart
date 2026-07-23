String? validateFormField(String? value, String? Function(String?)? validator) {
  if (validator == null) return null;
  return validator(value);
}

String formatFieldError(String? error) {
  if (error == null) return '';
  return error;
}

bool shouldShowError(bool touched, bool submitted, String? error) {
  if (error == null) return false;
  return touched || submitted;
}
