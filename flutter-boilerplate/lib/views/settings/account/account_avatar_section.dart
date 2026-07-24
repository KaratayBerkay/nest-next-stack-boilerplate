import 'package:flutter/material.dart';

import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

class AccountAvatarSection extends StatelessWidget {
  final String name;
  final String? email;
  final String? imageUrl;
  final VoidCallback? onChangeAvatar;

  const AccountAvatarSection({
    super.key,
    required this.name,
    this.email,
    this.imageUrl,
    this.onChangeAvatar,
  });

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Center(
      child: Column(
        children: [
          Avatar(name: name, imageUrl: imageUrl, radius: 32),
          const SizedBox(height: 12),
          Text(
            name,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          if (email != null)
            Text(email!, style: TextStyle(color: colors.fgMuted)),
          if (onChangeAvatar != null) ...[
            const SizedBox(height: 8),
            Button(
              variant: ButtonVariant.ghost,
              size: ButtonSize.sm,
              onPressed: onChangeAvatar,
              child: const Text('Change Avatar'),
            ),
          ],
        ],
      ),
    );
  }
}
