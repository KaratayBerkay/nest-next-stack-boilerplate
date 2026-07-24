import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';
import 'messages_sidebar.dart';

class MediumMessagesPage extends StatelessWidget {
  final String lang;

  const MediumMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        Expanded(
          child: Center(child: Text(t.messagesMediumDescription)),
        ),
      ],
    );
  }
}
