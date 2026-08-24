import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/container.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_provider.dart';
import 'package:flutter_boilerplate/lib/rtc/rtc_call_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/messages/query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../hooks/use_messages_page.dart';
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
    final onlineUsers = ref.watch(onlineUsersProvider);
    final typingUsers = ref.watch(typingUsersProvider);
    final rtcState = ref.watch(rtcCallProvider);

    return convAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (convs) {
        final conv = convs.where((c) => c.id == conversationId).firstOrNull;
        final name = conv?.userName ?? 'Chat';
        final avatarUrl = conv?.userAvatarUrl;
        final isOnline = onlineUsers.contains(conversationId);
        final isTyping = typingUsers.containsKey(conversationId);

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            border: Border(bottom: BorderSide(color: colors.border)),
          ),
          child: Row(
            children: [
              // Only shown on mobile, where ChatView replaces the
              // conversation list entirely — desktop shows both side by
              // side, so there's nothing to "go back" to (matches web's
              // `mr-1 md:hidden` on this same button).
              if (context.isMobile)
                IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => ref
                      .read(selectedConversationUserIdProvider.notifier)
                      .state = null,
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
                      isTyping
                          ? t.messagesTyping
                          : isOnline
                              ? t.messagesConnected
                              : t.messagesDisconnected,
                      style: TextStyle(
                        fontSize: 11,
                        color: isTyping
                            ? colors.brand
                            : isOnline
                                ? colors.success
                                : colors.fgMuted,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.call_outlined),
                tooltip: t.rtcVoiceCallLabel,
                onPressed: rtcState.phase == RtcCallPhase.idle && isOnline
                    ? () => ref.read(rtcCallProvider.notifier).startCall(
                          RtcCallPeer(
                            id: conversationId,
                            name: name,
                            avatarUrl: avatarUrl,
                          ),
                          false,
                        )
                    : null,
              ),
              IconButton(
                icon: const Icon(Icons.videocam_outlined),
                tooltip: t.rtcVideoCallLabel,
                onPressed: rtcState.phase == RtcCallPhase.idle && isOnline
                    ? () => ref.read(rtcCallProvider.notifier).startCall(
                          RtcCallPeer(
                            id: conversationId,
                            name: name,
                            avatarUrl: avatarUrl,
                          ),
                          true,
                        )
                    : null,
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
