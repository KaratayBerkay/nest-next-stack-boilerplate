import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/realtime/realtime_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

/// Transient "new message" banner shown just under the header for ~3s when a
/// DM or room message arrives — mirrors the web's `HeaderMessageBanner`.
/// Distinct from `ChatMessageBubble` (the per-message bubble inside an open
/// conversation's transcript).
class HeaderMessageBanner extends ConsumerWidget {
  final String lang;

  const HeaderMessageBanner({super.key, required this.lang});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(headerMessageBannerProvider);
    final colors = AppColors.of(context);

    return Align(
      alignment: Alignment.topCenter,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, animation) => FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, -0.15),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        ),
        child: data == null
            ? const SizedBox.shrink(key: ValueKey('empty'))
            : _BannerCard(
                key: ValueKey(data.id),
                data: data,
                lang: lang,
                colors: colors,
              ),
      ),
    );
  }
}

class _BannerCard extends ConsumerWidget {
  final HeaderMessageBannerData data;
  final String lang;
  final AppColors colors;

  const _BannerCard({
    super.key,
    required this.data,
    required this.lang,
    required this.colors,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = AppLocalizations.of(context);
    final body = data.body.trim();
    final hasBody = body.isNotEmpty && body != '[Encrypted]';
    final preview = hasBody
        ? body
        : data.hasAttachments
            ? '\u{1F4CE} ${t.v1ShellAttachmentPreview}'
            : '';

    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () {
            ref.read(headerMessageBannerProvider.notifier).state = null;
            context.go(
              data.isRoom
                  ? '/v1/$lang/chat-room?conversation=${data.targetId}'
                  : '/v1/$lang/messages?user=${data.targetId}',
            );
          },
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Avatar(
                  imageUrl: data.avatarUrl,
                  name: data.senderName,
                  radius: 18,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        data.senderName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: colors.fg,
                        ),
                      ),
                      if (preview.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          preview,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            color: colors.fgMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
