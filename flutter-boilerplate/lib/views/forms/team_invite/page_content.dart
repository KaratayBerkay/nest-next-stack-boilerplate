import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../validators/auth/schema.dart' as auth;

class FormsTeamInvitePageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsTeamInvitePageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsTeamInvitePageContent> createState() => _FormsTeamInvitePageContentState();
}

class _FormsTeamInvitePageContentState extends ConsumerState<FormsTeamInvitePageContent> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrls = <TextEditingController>[TextEditingController()];
  String _role = 'member';

  @override
  void dispose() {
    for (final c in _emailCtrls) {
      c.dispose();
    }
    super.dispose();
  }

  void _addEmail() {
    setState(() => _emailCtrls.add(TextEditingController()));
  }

  void _removeEmail(int index) {
    setState(() {
      _emailCtrls[index].dispose();
      _emailCtrls.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Team Invite')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Invite Team Members', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    ..._emailCtrls.asMap().entries.map((entry) => Padding(
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
                          if (_emailCtrls.length > 1)
                            IconButton(
                              icon: const Icon(Icons.remove_circle_outline),
                              onPressed: () => _removeEmail(entry.key),
                            ),
                        ],
                      ),
                    ),),
                    TextButton.icon(
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Add Another'),
                      onPressed: _addEmail,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _role,
                      items: const [
                        DropdownMenuItem(value: 'member', child: Text('Member')),
                        DropdownMenuItem(value: 'admin', child: Text('Admin')),
                        DropdownMenuItem(value: 'viewer', child: Text('Viewer')),
                      ],
                      onChanged: (v) => setState(() => _role = v!),
                      decoration: const InputDecoration(labelText: 'Role', border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    Button(child: const Text('Send Invites'), onPressed: () {
                      if (_formKey.currentState!.validate()) {}
                    },),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
