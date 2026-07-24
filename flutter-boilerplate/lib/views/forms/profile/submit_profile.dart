import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

Map<String, dynamic> collectProfileData({
  required TextEditingController nameCtrl,
  required TextEditingController emailCtrl,
  required TextEditingController bioCtrl,
  required bool notificationsEnabled,
}) {
  return {
    'name': nameCtrl.text,
    'email': emailCtrl.text,
    'bio': bioCtrl.text,
    'notifications': notificationsEnabled,
  };
}

bool validateProfileForm(GlobalKey<FormState> formKey) {
  return formKey.currentState?.validate() ?? false;
}

void submitProfile(
  BuildContext context,
  GlobalKey<FormState> formKey, {
  required TextEditingController nameCtrl,
  required TextEditingController emailCtrl,
  required TextEditingController bioCtrl,
  required bool notificationsEnabled,
}) {
  if (!validateProfileForm(formKey)) return;

  final data = collectProfileData(
    nameCtrl: nameCtrl,
    emailCtrl: emailCtrl,
    bioCtrl: bioCtrl,
    notificationsEnabled: notificationsEnabled,
  );

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(
        AppLocalizations.of(context)
            .formsProfileSavedName(data['name'] as String),
      ),
    ),
  );
}
