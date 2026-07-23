import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../constants/theme.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';

class MessagesSidebarFriends extends ConsumerWidget {
  const MessagesSidebarFriends({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);

    return const EmptyWidget(
      title: 'No friends online',
      icon: Icons.people_outline,
      description: 'Connect with friends to start chatting',
    );
  }
}
