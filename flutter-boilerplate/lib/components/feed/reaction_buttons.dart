import 'package:flutter/material.dart';

import '../../constants/theme.dart';
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
    setState(() => _submitting = true);
    try {
      if (widget.onToggle != null) {
        await widget.onToggle!(type);
      }
      widget.onReactionChange?.call();
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to react')),
      );
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

    return Tooltip(
      message: 'React',
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
            if (total > 0)
              SizedBox(
                height: 24,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  shrinkWrap: true,
                  itemCount: _reactionTypes.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 2),
                  itemBuilder: (context, index) {
                    final type = _reactionTypes[index];
                    final count =
                        widget.reactions.where((r) => r.type == type).length;
                    final active = widget.reactions.any(
                      (r) =>
                          r.type == type &&
                          r.userId == widget.currentUserId,
                    );

                    return InkWell(
                      onTap: _submitting
                          ? null
                          : () => _handleReaction(type),
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
                            if (count > 0)
                              Padding(
                                padding: const EdgeInsets.only(left: 1),
                                child: Text(
                                  '$count',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: active
                                        ? Colors.white
                                        : Colors.white70,
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
          ],
        ),
      ),
    );
  }
}
