import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/form_text_field.dart';
import '../../../l10n/app_localizations.dart';
import '../../../validators/auth/schema.dart' as auth;

class FormsTeamInvitePageContent extends ConsumerStatefulWidget {
  final String lang;

  const FormsTeamInvitePageContent({super.key, required this.lang});

  @override
  ConsumerState<FormsTeamInvitePageContent> createState() =>
      _FormsTeamInvitePageContentState();
}

class _FormsTeamInvitePageContentState
    extends ConsumerState<FormsTeamInvitePageContent> {
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
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.formsTeamInvitePageTitle)),
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
                    Text(
                      t.formsTeamInviteTitle,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ..._emailCtrls.asMap().entries.map(
                          (entry) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              children: [
                                Expanded(
                                  child: FormTextField(
                                    controller: entry.value,
                                    label: t.formsTeamInviteEmailLabel,
                                    validator: auth.validateEmail,
                                  ),
                                ),
                                if (_emailCtrls.length > 1)
                                  IconButton(
                                    icon:
                                        const Icon(Icons.remove_circle_outline),
                                    onPressed: () => _removeEmail(entry.key),
                                  ),
                              ],
                            ),
                          ),
                        ),
                    TextButton.icon(
                      icon: const Icon(Icons.add, size: 18),
                      label: Text(t.formsTeamInviteAddAnother),
                      onPressed: _addEmail,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _role,
                      items: [
                        DropdownMenuItem(
                          value: 'member',
                          child: Text(t.formsTeamInviteRoleMember),
                        ),
                        DropdownMenuItem(
                          value: 'admin',
                          child: Text(t.formsTeamInviteRoleAdmin),
                        ),
                        DropdownMenuItem(
                          value: 'viewer',
                          child: Text(t.formsTeamInviteRoleViewer),
                        ),
                      ],
                      onChanged: (v) => setState(() => _role = v!),
                      decoration: InputDecoration(
                        labelText: t.formsTeamInviteRoleLabel,
                        border: const OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Button(
                      child: Text(t.formsTeamInviteSend),
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
      ),
    );
  }
}
