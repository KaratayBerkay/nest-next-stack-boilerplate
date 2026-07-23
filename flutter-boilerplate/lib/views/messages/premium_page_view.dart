import 'package:flutter/material.dart';

import 'messages_sidebar.dart';

class PremiumMessagesPage extends StatelessWidget {
  final String lang;

  const PremiumMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        const Expanded(
          child: Center(child: Text('Premium chat with video calls')),
        ),
      ],
    );
  }
}
