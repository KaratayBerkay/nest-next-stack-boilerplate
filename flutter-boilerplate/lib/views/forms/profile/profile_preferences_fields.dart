import 'package:flutter/material.dart';

import '../../../constants/theme.dart';

class ProfilePreferencesFields extends StatefulWidget {
  final bool notificationsEnabled;
  final ValueChanged<bool> onNotificationsChanged;

  const ProfilePreferencesFields({
    super.key,
    required this.notificationsEnabled,
    required this.onNotificationsChanged,
  });

  @override
  State<ProfilePreferencesFields> createState() => _ProfilePreferencesFieldsState();
}

class _ProfilePreferencesFieldsState extends State<ProfilePreferencesFields> {
  String _selectedTheme = 'system';
  String _selectedLanguage = 'en';

  final _themes = ['light', 'dark', 'system'];
  final _languages = [
    {'code': 'en', 'label': 'English'},
    {'code': 'tr', 'label': 'Türkçe'},
    {'code': 'de', 'label': 'Deutsch'},
  ];

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Preferences', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        SwitchListTile(
          title: const Text('Email Notifications'),
          subtitle: Text('Receive updates about your account', style: TextStyle(color: colors.fgMuted, fontSize: 12)),
          value: widget.notificationsEnabled,
          onChanged: widget.onNotificationsChanged,
          contentPadding: EdgeInsets.zero,
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedTheme,
          items: _themes.map((t) => DropdownMenuItem(value: t, child: Text(t[0].toUpperCase() + t.substring(1)))).toList(),
          onChanged: (v) => setState(() => _selectedTheme = v!),
          decoration: const InputDecoration(labelText: 'Theme', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: _selectedLanguage,
          items: _languages.map((l) => DropdownMenuItem(value: l['code'], child: Text(l['label']!))).toList(),
          onChanged: (v) => setState(() => _selectedLanguage = v!),
          decoration: const InputDecoration(labelText: 'Language', border: OutlineInputBorder()),
        ),
      ],
    );
  }
}
