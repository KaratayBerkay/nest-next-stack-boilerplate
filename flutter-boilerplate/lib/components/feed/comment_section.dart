import 'package:flutter/material.dart';
import 'package:flutter_boilerplate/lib/date_time.dart';

import '../../constants/theme.dart';
import '../../types/feed/comment.dart';
import '../ui/avatar/avatar.dart';
import 'reaction_buttons.dart';

class CommentSection extends StatefulWidget {
  final String postId;
  final List<Comment> comments;
  final String? currentUserId;
  final VoidCallback? onCommentAdded;
  final Future<void> Function(String postId, String body, String? parentId)?
      onCreateComment;
  final Future<void> Function(String commentId, String body)? onUpdateComment;
  final Future<void> Function(String commentId)? onDeleteComment;
  final Future<void> Function(String type, String? postId, String? commentId)?
      onToggleReaction;

  const CommentSection({
    super.key,
    required this.postId,
    this.comments = const [],
    this.currentUserId,
    this.onCommentAdded,
    this.onCreateComment,
    this.onUpdateComment,
    this.onDeleteComment,
    this.onToggleReaction,
  });

  @override
  State<CommentSection> createState() => _CommentSectionState();
}

class _CommentSectionState extends State<CommentSection> {
  final _bodyController = TextEditingController();
  final _editController = TextEditingController();
  String? _replyTo;
  bool _submitting = false;
  String? _editingId;

  @override
  void dispose() {
    _bodyController.dispose();
    _editController.dispose();
    super.dispose();
  }

  List<Comment> get _topLevel =>
      widget.comments.where((c) => c.parentId == null).toList();

  List<Comment> _replies(String parentId) =>
      widget.comments.where((c) => c.parentId == parentId).toList();

  bool _isOwn(Comment comment) =>
      widget.currentUserId != null && comment.authorId == widget.currentUserId;

  Future<void> _handleSubmit() async {
    final text = _bodyController.text.trim();
    if (text.isEmpty || _submitting) return;
    setState(() => _submitting = true);
    try {
      await widget.onCreateComment?.call(widget.postId, text, _replyTo);
      _bodyController.clear();
      setState(() => _replyTo = null);
      widget.onCommentAdded?.call();
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Network error')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _handleEdit(String commentId) async {
    final text = _editController.text.trim();
    if (text.isEmpty) return;
    try {
      await widget.onUpdateComment?.call(commentId, text);
      setState(() => _editingId = null);
      widget.onCommentAdded?.call();
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update comment')),
      );
    }
  }

  Future<void> _handleDelete(String commentId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete comment'),
        content: const Text('Are you sure you want to delete this comment?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        await widget.onDeleteComment?.call(commentId);
        widget.onCommentAdded?.call();
      } catch (_) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to delete comment')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _bodyController,
                  decoration: InputDecoration(
                    hintText: _replyTo != null ? 'Reply...' : 'Write a comment...',
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: colors.border),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                  style: const TextStyle(fontSize: 13),
                  onSubmitted: (_) => _handleSubmit(),
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: _bodyController.text.trim().isEmpty || _submitting
                    ? null
                    : _handleSubmit,
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
                child: Text(
                  _replyTo != null ? 'Reply' : 'Send',
                  style: const TextStyle(fontSize: 12),
                ),
              ),
              if (_replyTo != null) ...[
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () => setState(() => _replyTo = null),
                  child: const Text('Cancel', style: TextStyle(fontSize: 12)),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 8),
        if (widget.comments.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'No comments yet.',
              style: TextStyle(color: colors.fgMuted, fontSize: 11),
            ),
          )
        else
          ..._topLevel.map((comment) => _CommentTile(
                comment: comment,
                colors: colors,
                isOwn: _isOwn(comment),
                replies: _replies(comment.id),
                editingId: _editingId,
                editController: _editController,
                currentUserId: widget.currentUserId,
                onReply: () => setState(() => _replyTo = comment.id),
                onEditStart: () {
                  _editController.text = comment.body;
                  setState(() => _editingId = comment.id);
                },
                onEditCancel: () => setState(() => _editingId = null),
                onEditSave: () => _handleEdit(comment.id),
                onDelete: () => _handleDelete(comment.id),
                onToggleReaction: widget.onToggleReaction,
                onCommentAdded: widget.onCommentAdded,
              ),),
      ],
    );
  }
}

class _CommentTile extends StatelessWidget {
  final Comment comment;
  final AppColors colors;
  final bool isOwn;
  final List<Comment> replies;
  final String? editingId;
  final TextEditingController editController;
  final String? currentUserId;
  final VoidCallback onReply;
  final VoidCallback onEditStart;
  final VoidCallback onEditCancel;
  final VoidCallback onEditSave;
  final VoidCallback onDelete;
  final Future<void> Function(String type, String? postId, String? commentId)?
      onToggleReaction;
  final VoidCallback? onCommentAdded;

  const _CommentTile({
    required this.comment,
    required this.colors,
    required this.isOwn,
    required this.replies,
    required this.editingId,
    required this.editController,
    this.currentUserId,
    required this.onReply,
    required this.onEditStart,
    required this.onEditCancel,
    required this.onEditSave,
    required this.onDelete,
    this.onToggleReaction,
    this.onCommentAdded,
  });

  @override
  Widget build(BuildContext context) {
    final isEditing = editingId == comment.id;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.surface,
              border: Border.all(color: colors.border),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Avatar(
                      name: comment.authorName,
                      radius: 10,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      comment.authorName,
                      style: TextStyle(
                        color: colors.fg,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      DateTimeHelper.relative(comment.createdAt),
                      style: TextStyle(
                        color: colors.fgMuted,
                        fontSize: 9,
                      ),
                    ),
                    const Spacer(),
                    if (comment.reactions.isNotEmpty)
                      ReactionInline(
                        commentId: comment.id,
                        reactions: comment.reactions,
                        currentUserId: currentUserId,
                        onReactionChange: onCommentAdded,
                      ),
                    if (!isOwn)
                      TextButton(
                        onPressed: onReply,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          'Reply',
                          style: TextStyle(
                            fontSize: 9,
                            color: colors.fgMuted,
                          ),
                        ),
                      ),
                    if (isOwn && !isEditing) ...[
                      IconButton(
                        icon: Icon(Icons.edit_outlined,
                            size: 12, color: colors.fgMuted,),
                        onPressed: onEditStart,
                        constraints: const BoxConstraints(
                            minWidth: 24, minHeight: 24,),
                        padding: EdgeInsets.zero,
                        tooltip: 'Edit',
                      ),
                      IconButton(
                        icon: Icon(Icons.delete_outline,
                            size: 12, color: colors.fgMuted,),
                        onPressed: onDelete,
                        constraints: const BoxConstraints(
                            minWidth: 24, minHeight: 24,),
                        padding: EdgeInsets.zero,
                        tooltip: 'Delete',
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                if (isEditing)
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: editController,
                          autofocus: true,
                          style: TextStyle(color: colors.fg, fontSize: 13),
                          decoration: InputDecoration(
                            isDense: true,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(6),
                              borderSide: BorderSide(color: colors.border),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6,),
                          ),
                          onSubmitted: (_) => onEditSave(),
                        ),
                      ),
                      const SizedBox(width: 6),
                      FilledButton(
                        onPressed: onEditSave,
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6,),
                        ),
                        child: const Text('Save',
                            style: TextStyle(fontSize: 11),),
                      ),
                      const SizedBox(width: 4),
                      TextButton(
                        onPressed: onEditCancel,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 6,),
                          minimumSize: Size.zero,
                        ),
                        child: const Text('Cancel',
                            style: TextStyle(fontSize: 11),),
                      ),
                    ],
                  )
                else
                  Text(
                    comment.body,
                    style: TextStyle(
                      color: colors.fgMuted,
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),
              ],
            ),
          ),
          ...replies.map((reply) => Padding(
                padding: const EdgeInsets.only(left: 16, top: 2),
                child: _CommentTile(
                  comment: reply,
                  colors: colors,
                  isOwn: isOwn,
                  replies: const [],
                  editingId: editingId,
                  editController: editController,
                  currentUserId: currentUserId,
                  onReply: onReply,
                  onEditStart: () {
                    editController.text = reply.body;
                    onEditStart;
                  },
                  onEditCancel: onEditCancel,
                  onEditSave: () => onEditSave,
                  onDelete: onDelete,
                  onToggleReaction: onToggleReaction,
                  onCommentAdded: onCommentAdded,
                ),
              ),),
        ],
      ),
    );
  }
}
