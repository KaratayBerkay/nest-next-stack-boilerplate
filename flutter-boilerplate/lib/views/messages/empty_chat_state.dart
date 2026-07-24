import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';
import '../../l10n/app_localizations.dart';

class EmptyChatState extends StatelessWidget {
  const EmptyChatState({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return EmptyWidget(
      title: t.messagesSelectConversation,
      description: t.messagesSelectConversationDescription,
      icon: Icons.chat_bubble_outline,
    );
  }
}
