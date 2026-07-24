import 'package:flutter/material.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../l10n/app_localizations.dart';

class ProfileAvatarField extends StatelessWidget {
  final String? name;
  final String? imageUrl;
  final double radius;
  final VoidCallback? onChange;

  const ProfileAvatarField({
    super.key,
    this.name = 'User',
    this.imageUrl,
    this.radius = 40,
    this.onChange,
  });

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Center(
      child: Column(
        children: [
          Avatar(name: name!, imageUrl: imageUrl, radius: radius),
          const SizedBox(height: 8),
          Button(
            variant: ButtonVariant.ghost,
            size: ButtonSize.sm,
            onPressed: onChange,
            child: Text(t.formsProfileChangeAvatar),
          ),
        ],
      ),
    );
  }
}
