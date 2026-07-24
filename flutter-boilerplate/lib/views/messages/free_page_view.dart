import 'package:flutter/material.dart';

import 'package:flutter_boilerplate/lib/container.dart';
import '../../l10n/app_localizations.dart';
import 'messages_sidebar.dart';

class FreeMessagesPage extends StatelessWidget {
  final String lang;

  const FreeMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    if (context.isMobile) {
      return _MobileMessagesView(t: t);
    }
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        Expanded(
          child: Center(
            child: Text(
              t.messagesSelectConversation,
              style: const TextStyle(color: Colors.grey),
            ),
          ),
        ),
      ],
    );
  }
}

class _MobileMessagesView extends StatelessWidget {
  final AppLocalizations t;
  const _MobileMessagesView({required this.t});

  @override
  Widget build(BuildContext context) {
    return Center(child: Text(t.messagesTitle));
  }
}
