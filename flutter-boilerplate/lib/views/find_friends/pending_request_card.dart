import 'package:flutter/material.dart';

import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';
import '../../types/messages/friend_request_types.dart';

enum _PendingAction { accept, decline }

class PendingRequestCard extends StatefulWidget {
  final FriendRequest request;
  final Future<void> Function()? onAccept;
  final Future<void> Function()? onDecline;

  const PendingRequestCard({
    super.key,
    required this.request,
    this.onAccept,
    this.onDecline,
  });

  @override
  State<PendingRequestCard> createState() => _PendingRequestCardState();
}

class _PendingRequestCardState extends State<PendingRequestCard> {
  // Regression: this previously discarded the accept/decline handlers'
  // errors entirely — a 404 (e.g. the wrong id being sent) threw an
  // unhandled exception with the row just sitting there, no explanation,
  // and nothing stopped a rapid double-tap from firing two mutations.
  // Mirrors the web's PendingRequestCard.
  _PendingAction? _pendingAction;

  Future<void> _respond(
    _PendingAction action,
    Future<void> Function()? handler,
  ) async {
    if (_pendingAction != null || handler == null) return;
    setState(() => _pendingAction = action);
    try {
      await handler();
    } catch (_) {
      if (mounted) {
        final t = AppLocalizations.of(context);
        showToast(
          context,
          action == _PendingAction.accept
              ? t.findFriendsFailedToAcceptRequest
              : t.findFriendsFailedToDeclineRequest,
          type: ToastType.error,
        );
      }
    } finally {
      if (mounted) setState(() => _pendingAction = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final busy = _pendingAction != null;

    return Card(
      child: ListTile(
        leading: Avatar(
          name: widget.request.fromUserName,
          imageUrl: widget.request.fromUserAvatar,
        ),
        title: Text(widget.request.fromUserName),
        subtitle: Text(
          _timeAgo(widget.request.createdAt),
          style: TextStyle(color: colors.fgMuted, fontSize: 12),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: _pendingAction == _PendingAction.accept
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: colors.success,
                      ),
                    )
                  : Icon(Icons.check_circle, color: colors.success),
              onPressed: busy || widget.onAccept == null
                  ? null
                  : () => _respond(_PendingAction.accept, widget.onAccept),
            ),
            IconButton(
              icon: _pendingAction == _PendingAction.decline
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: colors.danger,
                      ),
                    )
                  : Icon(Icons.cancel, color: colors.danger),
              onPressed: busy || widget.onDecline == null
                  ? null
                  : () => _respond(_PendingAction.decline, widget.onDecline),
            ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
