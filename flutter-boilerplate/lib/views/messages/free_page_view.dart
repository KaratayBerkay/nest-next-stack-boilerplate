import 'package:flutter/material.dart';

import '../../lib/container.dart';
import 'messages_sidebar.dart';

class FreeMessagesPage extends StatelessWidget {
  final String lang;

  const FreeMessagesPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    if (context.isMobile) {
      return const _MobileMessagesView();
    }
    return Row(
      children: [
        MessagesSidebar(lang: lang),
        const Expanded(
          child: Center(
            child: Text('Select a conversation', style: TextStyle(color: Colors.grey)),
          ),
        ),
      ],
    );
  }
}

class _MobileMessagesView extends StatelessWidget {
  const _MobileMessagesView();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Messages page'));
  }
}
