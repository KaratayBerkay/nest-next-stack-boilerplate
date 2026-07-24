import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/query.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../l10n/app_localizations.dart';
import 'medium_find_friends_content.dart';

class MediumFindFriendsPage extends ConsumerWidget {
  final String lang;

  const MediumFindFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final suggestedAsync = ref.watch(suggestedFriendsProvider);

    return Scaffold(
      appBar: AppBar(title: Text(t.findFriendsTitle)),
      body: suggestedAsync.when(
        loading: () => const Column(
          children: [
            SizedBox(height: 16),
            Spinner(),
          ],
        ),
        error: (err, _) => EmptyWidget(
          title: t.findFriendsFailedToLoadSuggestions,
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
