import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../components/ui/empty/empty.dart';

class EmptyChatState extends StatelessWidget {
  const EmptyChatState({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyWidget(
      title: 'Select a conversation',
      description: 'Choose a conversation from the sidebar to start chatting',
      icon: Icons.chat_bubble_outline,
    );
  }
}
