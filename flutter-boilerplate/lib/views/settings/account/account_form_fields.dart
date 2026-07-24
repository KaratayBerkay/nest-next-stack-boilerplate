import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

class AccountFormFields extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController? bioController;
  final int? bioMaxLines;

  const AccountFormFields({
    super.key,
    required this.nameController,
    required this.emailController,
    this.bioController,
    this.bioMaxLines = 3,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Column(
      children: [
        TextField(
          controller: nameController,
          decoration: InputDecoration(labelText: t.settingsDisplayName),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: emailController,
          decoration: InputDecoration(labelText: t.settingsEmail),
          keyboardType: TextInputType.emailAddress,
        ),
        if (bioController != null) ...[
          const SizedBox(height: 12),
          TextField(
            controller: bioController,
            decoration: InputDecoration(labelText: t.settingsBio),
            maxLines: bioMaxLines,
          ),
        ],
      ],
    );
  }
}
