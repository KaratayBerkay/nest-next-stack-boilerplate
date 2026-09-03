import 'package:flutter/material.dart';

import '../../api/server/users/search.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/toast/toast.dart';
import '../../l10n/app_localizations.dart';

class UserSearchCard extends StatefulWidget {
  final UserSearchResult user;
  final bool isPending;
  final Future<void> Function()? onAdd;
  final VoidCallback? onTap;

  const UserSearchCard({
    super.key,
    required this.user,
    this.isPending = false,
    this.onAdd,
    this.onTap,
  });

  @override
  State<UserSearchCard> createState() => _UserSearchCardState();
}

class _UserSearchCardState extends State<UserSearchCard> {
  // Regression: this previously fired `onAdd` and forgot about it — no
  // loading state, no failure feedback, and a fast double-tap could send two
  // concurrent friend-request mutations. Mirrors the web's UserSearchCard.
  bool _sending = false;

  Future<void> _handleAdd() async {
    if (_sending || widget.onAdd == null) return;
    setState(() => _sending = true);
    try {
      await widget.onAdd!();
    } catch (_) {
      if (mounted) {
        final t = AppLocalizations.of(context);
        showToast(
          context,
          t.findFriendsFailedToSendRequest,
          type: ToastType.error,
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Card(
      child: ListTile(
        leading: Avatar(
          name: widget.user.name,
          imageUrl: widget.user.avatarUrl,
        ),
        title: Text(widget.user.name),
        trailing: widget.onAdd == null
            ? null
            : widget.isPending
                ? Text(
                    t.findFriendsPending,
                    style: Theme.of(context).textTheme.bodySmall,
                  )
                : FilledButton.tonal(
                    onPressed: _sending ? null : _handleAdd,
                    child: _sending
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(t.findFriendsAddFriend),
                  ),
        onTap: widget.onTap,
      ),
    );
  }
}
