import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import 'messages_sidebar.dart';

class BasicMessagesPage extends StatelessWidget {
  final String lang;

  const BasicMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        Expanded(
          child: Center(child: Text(t.messagesBasicDescription)),
        ),
      ],
    );
  }
}
