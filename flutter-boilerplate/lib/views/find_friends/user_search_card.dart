import 'package:flutter/material.dart';

import '../../api/server/users/search.dart';
import '../../components/ui/avatar/avatar.dart';
class UserSearchCard extends StatelessWidget {
  final UserSearchResult user;
  final VoidCallback? onAdd;
  final VoidCallback? onTap;

  const UserSearchCard({
    super.key,
    required this.user,
    this.onAdd,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Avatar(
          name: user.name,
          imageUrl: user.avatarUrl,
        ),
        title: Text(user.name),
        trailing: onAdd != null
            ? FilledButton.tonal(
                onPressed: onAdd,
                child: const Text('Add Friend'),
              )
            : null,
        onTap: onTap,
      ),
    );
  }
}
