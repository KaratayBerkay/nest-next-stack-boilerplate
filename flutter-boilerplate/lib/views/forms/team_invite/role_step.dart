import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Role',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Choose what permissions invited members will have',
          style: TextStyle(color: colors.fgMuted, fontSize: 13),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          initialValue: selectedRole,
          items: const [
            DropdownMenuItem(
              value: 'member',
              child: Text('Member — Can view and edit assigned projects'),
            ),
            DropdownMenuItem(
              value: 'admin',
              child: Text('Admin — Full access to all projects and settings'),
            ),
            DropdownMenuItem(
              value: 'viewer',
              child: Text('Viewer — Read-only access to assigned projects'),
            ),
          ],
          onChanged: (v) => onChanged(v!),
          decoration: const InputDecoration(
            labelText: 'Role',
            border: OutlineInputBorder(),
          ),
        ),
      ],
    );
  }
}
