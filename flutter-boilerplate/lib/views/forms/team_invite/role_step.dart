import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

class RoleStep extends StatelessWidget {
  final String selectedRole;
  final ValueChanged<String> onChanged;

  const RoleStep({
    super.key,
    required this.selectedRole,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    final t = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          t.formsTeamInviteRoleSelect,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          t.formsTeamInviteRoleHint,
          style: TextStyle(color: colors.fgMuted, fontSize: 13),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          initialValue: selectedRole,
          items: [
            DropdownMenuItem(
              value: 'member',
              child: Text(t.formsTeamInviteRoleMemberDescription),
            ),
            DropdownMenuItem(
              value: 'admin',
              child: Text(t.formsTeamInviteRoleAdminDescription),
            ),
            DropdownMenuItem(
              value: 'viewer',
              child: Text(t.formsTeamInviteRoleViewerDescription),
            ),
          ],
          onChanged: (v) => onChanged(v!),
          decoration: InputDecoration(
            labelText: t.formsTeamInviteRoleLabel,
            border: const OutlineInputBorder(),
          ),
        ),
      ],
    );
  }
}
