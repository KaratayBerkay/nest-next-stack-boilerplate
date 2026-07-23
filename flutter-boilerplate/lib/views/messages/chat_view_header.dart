import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../constants/theme.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../api/client/messages/query.dart';

class ChatViewHeader extends ConsumerWidget {
  final String conversationId;
  final String lang;

  const ChatViewHeader({
    super.key,
    required this.conversationId,
    required this.lang,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = AppColors.of(context);
    final convAsync = ref.watch(conversationsProvider);

    return convAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (convs) {
        final conv = convs.where((c) => c.id == conversationId).firstOrNull;
        final name = conv?.userName ?? 'Chat';
        final avatarUrl = conv?.userAvatarUrl;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: colors.border)),
          ),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.pop(),
              ),
              Avatar(
                imageUrl: avatarUrl,
                name: name,
                radius: 18,
              ),
              const SizedBox(width: 8),
              Text(
                name,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
              ),
            ],
          ),
        );
      },
    );
  }
}
