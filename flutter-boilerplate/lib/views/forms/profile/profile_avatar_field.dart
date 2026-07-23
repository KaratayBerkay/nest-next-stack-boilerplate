import 'package:flutter/material.dart';

import '../../../constants/theme.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/avatar/avatar.dart';

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
    return Center(
      child: Column(
        children: [
          Avatar(name: name!, imageUrl: imageUrl, radius: radius),
          const SizedBox(height: 8),
          Button(
            variant: ButtonVariant.ghost,
            size: ButtonSize.sm,
            child: const Text('Change Avatar'),
            onPressed: onChange,
          ),
        ],
      ),
    );
  }
}
