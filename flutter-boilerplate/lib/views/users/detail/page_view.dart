import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/friends/actions.dart';
import '../../../api/server/profile/get.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../constants/theme.dart';

final _userDetailProvider = FutureProvider.family((ref, String userId) async {
  final server = ref.read(profileGetServerProvider);
  return server.call();
});

class UserDetailPageContent extends ConsumerWidget {
  final String lang;
  final String userId;

  const UserDetailPageContent({
    super.key,
    required this.lang,
    required this.userId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final userAsync = ref.watch(_userDetailProvider(userId));

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: userAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (user) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Center(
              child: Column(
                children: [
                  Avatar(name: user.name, radius: 40),
                  const SizedBox(height: 12),
                  Text(
                    user.name,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(user.email, style: TextStyle(color: colors.fgMuted)),
                  if (user.bio != null) ...[
                    const SizedBox(height: 8),
                    Text(user.bio!, textAlign: TextAlign.center),
                  ],
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Badge(
                        label: Text(
                          user.tier.toUpperCase(),
                          style: TextStyle(fontSize: 11, color: colors.surface),
                        ),
                        backgroundColor: colors.brand,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Button(
                    child: const Text('Add Friend'),
                    onPressed: () =>
                        ref.read(friendActionsProvider).sendRequest(user.id),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
