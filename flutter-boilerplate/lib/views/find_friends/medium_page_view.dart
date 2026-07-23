import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/query.dart';
import '../../api/server/friends/suggested.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../components/ui/empty/empty.dart';
import '../../constants/theme.dart';
import 'medium_find_friends_content.dart';

class MediumFindFriendsPage extends ConsumerWidget {
  final String lang;

  const MediumFindFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final suggestedAsync = ref.watch(suggestedFriendsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Find Friends')),
      body: suggestedAsync.when(
        loading: () => const Column(
          children: [
            SizedBox(height: 16),
            Spinner(),
          ],
        ),
        error: (err, _) => EmptyWidget(
          title: 'Failed to load suggestions',
          description: err.toString(),
          icon: Icons.error_outline,
        ),
        data: (suggested) => MediumFindFriendsContent(
          lang: lang,
          suggestedUsers: suggested,
        ),
      ),
    );
  }
}
