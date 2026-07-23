import 'package:flutter/material.dart';

import 'messages_sidebar.dart';

class MediumMessagesPage extends StatelessWidget {
  final String lang;

  const MediumMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        const Expanded(
          child: Center(child: Text('Medium chat with file sharing')),
        ),
      ],
    );
  }
}
