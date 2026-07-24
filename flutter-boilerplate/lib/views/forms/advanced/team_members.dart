import 'package:flutter/material.dart';

import '../../../components/ui/form_text_field.dart';
import '../../../constants/theme.dart';
import '../../../validators/auth/schema.dart' as auth;

class TeamMembers extends StatefulWidget {
  final List<TextEditingController> memberCtrls;

  const TeamMembers({super.key, required this.memberCtrls});

  @override
  State<TeamMembers> createState() => _TeamMembersState();
}

class _TeamMembersState extends State<TeamMembers> {
  void _addMember() {
    widget.memberCtrls.add(TextEditingController());
  }

  void _removeMember(int index) {
    widget.memberCtrls[index].dispose();
    widget.memberCtrls.removeAt(index);
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Team Members',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...widget.memberCtrls.asMap().entries.map(
              (entry) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: FormTextField(
                        controller: entry.value,
                        label: 'Member Email',
                        validator: auth.validateEmail,
                      ),
                    ),
                    if (widget.memberCtrls.length > 1)
                      IconButton(
                        icon: Icon(
                          Icons.remove_circle_outline,
                          color: colors.danger,
                        ),
                        onPressed: () =>
                            setState(() => _removeMember(entry.key)),
                      ),
                  ],
                ),
              ),
            ),
        TextButton.icon(
          icon: const Icon(Icons.add, size: 18),
          label: const Text('Add Member'),
          onPressed: () => setState(() => _addMember()),
        ),
      ],
    );
  }
}
