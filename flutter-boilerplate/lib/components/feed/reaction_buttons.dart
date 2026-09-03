import 'package:flutter/material.dart';

import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/feed/reaction.dart';

const _reactionTypes = ['LIKE', 'LOVE', 'LAUGH', 'WOW'];

const _emojis = <String, String>{
  'LIKE': '\u{1F44D}',
  'LOVE': '\u{2764}\u{FE0F}',
  'LAUGH': '\u{1F602}',
  'WOW': '\u{1F62E}',
};

class ReactionInline extends StatefulWidget {
  final String? postId;
  final String? commentId;
  final List<FeedReaction> reactions;
  final String? currentUserId;
  final VoidCallback? onReactionChange;
  final Future<void> Function(String type)? onToggle;

  const ReactionInline({
    super.key,
    this.postId,
    this.commentId,
    this.reactions = const [],
    this.currentUserId,
    this.onReactionChange,
    this.onToggle,
  });

  @override
  State<ReactionInline> createState() => _ReactionInlineState();
}

class _ReactionInlineState extends State<ReactionInline> {
  bool _submitting = false;

  Future<void> _handleReaction(String type) async {
    if (_submitting) return;
    final t = AppLocalizations.of(context);
    setState(() => _submitting = true);
    try {
      if (widget.onToggle != null) {
        await widget.onToggle!(type);
      }
      widget.onReactionChange?.call();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(t.feedFailedToReact)),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final total = widget.reactions.length;
    final userReacted = widget.currentUserId != null &&
        widget.reactions.any((r) => r.userId == widget.currentUserId);
    // Only the types someone actually picked — this used to always render
    // all 4 chips the instant any reaction existed, which was both wrong
    // (showing reaction types nobody used) and, combined with a long author
    // name, what overflowed the card (MOB-035).
    final activeTypes = _reactionTypes
        .where((type) => widget.reactions.any((r) => r.type == type))
        .toList();

    return Tooltip(
      message: AppLocalizations.of(context).feedReact,
      child: SizedBox(
        height: 28,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            InkWell(
              onTap: _submitting ? null : () => _handleReaction('LIKE'),
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  color: userReacted
                      ? colors.brand.withValues(alpha: 0.1)
                      : Colors.transparent,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.emoji_emotions_outlined,
                      size: 14,
                      color: userReacted ? colors.brand : colors.fgMuted,
                    ),
                    if (total > 0)
                      Padding(
                        padding: const EdgeInsets.only(left: 2),
                        child: Text(
                          '$total',
                          style: TextStyle(
                            fontSize: 10,
                            color: userReacted ? colors.brand : colors.fgMuted,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 2),
            if (activeTypes.isNotEmpty)
              // Flexible so this list is what gives way if ReactionInline's
              // own allotted width (see post_header.dart's trailing Row)
              // isn't enough — it already scrolls horizontally in isolation,
              // it just needs permission to be narrower than its content.
              Flexible(
                child: SizedBox(
                  height: 24,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    shrinkWrap: true,
                    itemCount: activeTypes.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 2),
                    itemBuilder: (context, index) {
                      final type = activeTypes[index];
                      final count =
                          widget.reactions.where((r) => r.type == type).length;
                      final active = widget.reactions.any(
                        (r) =>
                            r.type == type && r.userId == widget.currentUserId,
                      );

                      return InkWell(
                        onTap: _submitting ? null : () => _handleReaction(type),
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: active
                                ? Colors.white.withValues(alpha: 0.1)
                                : Colors.transparent,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _emojis[type] ?? '',
                                style: const TextStyle(fontSize: 12),
                              ),
                              Padding(
                                padding: const EdgeInsets.only(left: 1),
                                child: Text(
                                  '$count',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color:
                                        active ? Colors.white : Colors.white70,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
