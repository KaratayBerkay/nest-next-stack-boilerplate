import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/tier_view.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../components/ui/button/button.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../l10n/app_localizations.dart';
import '../settings_shell.dart';
import 'privacy_toggle_row.dart';

class SettingsPrivacyPageContent extends ConsumerWidget {
  final String lang;

  const SettingsPrivacyPageContent({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SettingsShellScaffold(
      lang: lang,
      child: TierGate(
        freeWidget: _PrivacySettings(lang: lang),
        basicWidget: _PrivacySettings(lang: lang),
        mediumWidget: _PrivacySettings(lang: lang),
        premiumWidget: _PrivacySettings(lang: lang),
      ),
    );
  }
}

class _PrivacySettings extends StatefulWidget {
  final String lang;

  const _PrivacySettings({required this.lang});

  @override
  State<_PrivacySettings> createState() => _PrivacySettingsState();
}

class _PrivacySettingsState extends State<_PrivacySettings> {
  bool _hideProfilePicture = false;
  bool _useNickname = false;
  late TextEditingController _nicknameCtrl;

  @override
  void initState() {
    super.initState();
    _nicknameCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _nicknameCtrl.dispose();
    super.dispose();
  }

  void _save() {
    showToast(context, 'Privacy settings saved');
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Column(
            children: [
              PrivacyToggleRow(
                title: t.settingsPrivacyHideProfilePicture,
                subtitle: t.settingsPrivacyHideProfilePictureDesc,
                value: _hideProfilePicture,
                onChanged: (v) => setState(() => _hideProfilePicture = v),
              ),
              PrivacyToggleRow(
                title: t.settingsPrivacyNickname,
                subtitle: t.settingsPrivacyNicknameDesc,
                value: _useNickname,
                onChanged: (v) => setState(() => _useNickname = v),
              ),
              if (_useNickname)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  child: TextField(
                    controller: _nicknameCtrl,
                    decoration: InputDecoration(
                      labelText: t.settingsPrivacyNicknamePlaceholder,
                      isDense: true,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Button(
          fullWidth: true,
          onPressed: _save,
          child: Text(t.settingsSave),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => context.push('/v1/${widget.lang}/settings/sessions'),
          child: Text(t.settingsPrivacySessionsNote),
        ),
      ],
    );
  }
}
