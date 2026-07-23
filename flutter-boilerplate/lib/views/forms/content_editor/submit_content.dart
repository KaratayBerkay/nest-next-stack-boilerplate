import 'package:flutter/material.dart';

Map<String, dynamic> collectContentData({
  required TextEditingController titleCtrl,
  required TextEditingController bodyCtrl,
  required TextEditingController tagsCtrl,
}) {
  return {
    'title': titleCtrl.text,
    'body': bodyCtrl.text,
    'tags': tagsCtrl.text,
  };
}

bool validateContentForm(GlobalKey<FormState> formKey) {
  return formKey.currentState?.validate() ?? false;
}

void publishContent(
  BuildContext context,
  GlobalKey<FormState> formKey, {
  required TextEditingController titleCtrl,
  required TextEditingController bodyCtrl,
  required TextEditingController tagsCtrl,
}) {
  if (!validateContentForm(formKey)) return;

  final data = collectContentData(
    titleCtrl: titleCtrl,
    bodyCtrl: bodyCtrl,
    tagsCtrl: tagsCtrl,
  );

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Published: ${data['title']}')),
  );
}

void saveDraft(
  BuildContext context, {
  required TextEditingController titleCtrl,
  required TextEditingController bodyCtrl,
  required TextEditingController tagsCtrl,
}) {
  final data = collectContentData(
    titleCtrl: titleCtrl,
    bodyCtrl: bodyCtrl,
    tagsCtrl: tagsCtrl,
  );

  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Draft saved: ${data['title']}')),
  );
}

void clearContentForm({
  required TextEditingController titleCtrl,
  required TextEditingController bodyCtrl,
  required TextEditingController tagsCtrl,
}) {
  titleCtrl.clear();
  bodyCtrl.clear();
  tagsCtrl.clear();
}
