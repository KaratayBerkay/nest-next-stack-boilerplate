import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/client/messages/query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../hooks/use_presence.dart';
import '../../l10n/app_localizations.dart';

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
    final t = AppLocalizations.of(context);
    final convAsync = ref.watch(conversationsProvider);
    final isOnline = ref.watch(isOnlineProvider);

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
              _PresenceAvatar(
                avatar: Avatar(
                  imageUrl: avatarUrl,
                  name: name,
                  radius: 18,
                ),
                isOnline: isOnline,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      isOnline ? t.messagesConnected : t.messagesDisconnected,
                      style: TextStyle(
                        fontSize: 11,
                        color: isOnline ? colors.success : colors.fgMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PresenceAvatar extends StatelessWidget {
  final Avatar avatar;
  final bool isOnline;

  const _PresenceAvatar({required this.avatar, required this.isOnline});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    return Stack(
      children: [
        if (isOnline)
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: colors.success, width: 2),
            ),
            child: Padding(
              padding: const EdgeInsets.all(2),
              child: avatar,
            ),
          )
        else
          avatar,
        if (isOnline)
          Positioned(
            right: 1,
            bottom: 1,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: colors.success,
                shape: BoxShape.circle,
                border: Border.all(color: colors.surface, width: 1.5),
              ),
            ),
          ),
      ],
    );
  }
}
