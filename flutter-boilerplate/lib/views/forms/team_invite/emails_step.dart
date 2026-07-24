import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../../validators/auth/schema.dart' as auth;

class EmailsStep extends StatelessWidget {
  final List<TextEditingController> emailCtrls;
  final bool maxReached;
  final VoidCallback onAdd;

  const EmailsStep({
    super.key,
    required this.emailCtrls,
    required this.maxReached,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final t = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Invite Team Members',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Enter email addresses of people you want to invite',
          style: TextStyle(color: colors.fgMuted, fontSize: 13),
        ),
        const SizedBox(height: 12),
        ...emailCtrls.asMap().entries.map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: FormTextField(
                        controller: entry.value,
                        label: 'Email Address',
                        validator: auth.validateEmail,
                      ),
                    ),
                    if (emailCtrls.length > 1)
                      IconButton(
                        icon: Icon(
                          Icons.remove_circle_outline,
                          color: colors.danger,
                        ),
                        onPressed: () {
                          entry.value.dispose();
                          emailCtrls.removeAt(entry.key);
                          (context as Element).markNeedsBuild();
                        },
                      ),
                  ],
                ),
              ),
            ),
        if (!maxReached)
          TextButton.icon(
            icon: const Icon(Icons.add, size: 18),
            label: Text(t.formsTeamInviteAddAnother),
            onPressed: onAdd,
          ),
      ],
    );
  }
}
