import 'package:flutter/material.dart';

Map<String, dynamic> collectAdvancedFormData({
  required TextEditingController nameCtrl,
  required TextEditingController emailCtrl,
  required TextEditingController bioCtrl,
  required TextEditingController companyCtrl,
  required TextEditingController roleCtrl,
  required TextEditingController industryCtrl,
  required List<TextEditingController> memberCtrls,
}) {
  return {
    'name': nameCtrl.text,
    'email': emailCtrl.text,
    'bio': bioCtrl.text,
    'company': companyCtrl.text,
    'role': roleCtrl.text,
    'industry': industryCtrl.text,
    'members': memberCtrls.map((c) => c.text).toList(),
  };
}

bool validateAdvancedForm(GlobalKey<FormState> formKey) {
  return formKey.currentState?.validate() ?? false;
}

void clearAdvancedForm({
  required TextEditingController nameCtrl,
  required TextEditingController emailCtrl,
  required TextEditingController bioCtrl,
  required TextEditingController companyCtrl,
  required TextEditingController roleCtrl,
  required TextEditingController industryCtrl,
}) {
  nameCtrl.clear();
  emailCtrl.clear();
  bioCtrl.clear();
  companyCtrl.clear();
  roleCtrl.clear();
  industryCtrl.clear();
}
