import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../l10n/app_localizations.dart';
import 'profile_avatar_field.dart';
import 'profile_basic_fields.dart';
import 'profile_preferences_fields.dart';

class FormsProfilePageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsProfilePageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsProfilePageContent> createState() =>
      _FormsProfilePageContentState();
}

class _FormsProfilePageContentState
    extends ConsumerState<FormsProfilePageContent> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController(text: 'John Doe');
  final _emailCtrl = TextEditingController(text: 'john@example.com');
  final _bioCtrl = TextEditingController(text: 'Full-stack developer');
  bool _notificationsEnabled = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ProfileAvatarField(onChange: () {}),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ProfileBasicFields(
                    nameCtrl: _nameCtrl,
                    emailCtrl: _emailCtrl,
                    bioCtrl: _bioCtrl,
                  ),
                  const SizedBox(height: 16),
                  ProfilePreferencesFields(
                    notificationsEnabled: _notificationsEnabled,
                    onNotificationsChanged: (v) =>
                        setState(() => _notificationsEnabled = v),
                  ),
                  const SizedBox(height: 16),
                  Button(
                    child: Text(t.formsProfileSave),
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {}
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
