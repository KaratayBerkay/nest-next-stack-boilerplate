import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/ui/empty/empty.dart';
import '../../l10n/app_localizations.dart';

class MessagesSidebarFriends extends ConsumerWidget {
  const MessagesSidebarFriends({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    return EmptyWidget(
      title: t.messagesNoFriends,
      icon: Icons.people_outline,
    );
  }
}
