import 'package:flutter/material.dart';

bool isFieldEmpty(String? value) {
  return value == null || value.trim().isEmpty;
}

bool isFieldValidEmail(String value) {
  return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(value);
}

bool isFieldMinLength(String value, int min) {
  return value.length >= min;
}

String? validateName(String? value) {
  if (isFieldEmpty(value)) return 'Name is required';
  return null;
}

String? validateEmailField(String? value) {
  if (isFieldEmpty(value)) return 'Email is required';
  if (!isFieldValidEmail(value!)) return 'Invalid email format';
  return null;
}

String? validatePasswordField(String? value) {
  if (isFieldEmpty(value)) return 'Password is required';
  if (!isFieldMinLength(value!, 6)) return 'Must be at least 6 characters';
  return null;
}

String? validateConfirmPassword(String? value, String password) {
  if (isFieldEmpty(value)) return 'Please confirm your password';
  if (value != password) return 'Passwords do not match';
  return null;
}
