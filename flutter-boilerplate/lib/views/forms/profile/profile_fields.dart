import 'package:flutter/material.dart';

import 'profile_avatar_field.dart';
import 'profile_basic_fields.dart';
import 'profile_preferences_fields.dart';

class ProfileFields extends StatelessWidget {
  final TextEditingController nameCtrl;
  final TextEditingController emailCtrl;
  final TextEditingController bioCtrl;
  final bool notificationsEnabled;
  final ValueChanged<bool> onNotificationsChanged;
  final VoidCallback? onChangeAvatar;

  const ProfileFields({
    super.key,
    required this.nameCtrl,
    required this.emailCtrl,
    required this.bioCtrl,
    this.notificationsEnabled = true,
    required this.onNotificationsChanged,
    this.onChangeAvatar,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ProfileAvatarField(onChange: onChangeAvatar),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ProfileBasicFields(
                  nameCtrl: nameCtrl,
                  emailCtrl: emailCtrl,
                  bioCtrl: bioCtrl,
                ),
                const SizedBox(height: 16),
                ProfilePreferencesFields(
                  notificationsEnabled: notificationsEnabled,
                  onNotificationsChanged: onNotificationsChanged,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
