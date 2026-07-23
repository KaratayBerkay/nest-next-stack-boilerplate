import 'package:flutter/material.dart';

import 'messages_sidebar.dart';

class BasicMessagesPage extends StatelessWidget {
  final String lang;

  const BasicMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        const Expanded(
          child: Center(child: Text('Basic chat features coming soon')),
        ),
      ],
    );
  }
}
