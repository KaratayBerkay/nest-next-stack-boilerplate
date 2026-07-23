import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../components/ui/empty/empty.dart';

class MessagesSidebarFriends extends ConsumerWidget {
  const MessagesSidebarFriends({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const EmptyWidget(
      title: 'No friends online',
      icon: Icons.people_outline,
      description: 'Connect with friends to start chatting',
    );
  }
}
