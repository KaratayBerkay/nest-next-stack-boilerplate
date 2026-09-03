import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../api/client/friends/actions.dart';
import '../../../api/server/messages/friends.dart';
import '../../../api/server/users/search.dart';
import '../../../components/ui/avatar/avatar.dart';
import '../../../components/ui/button/button.dart';
import '../../../components/ui/empty/empty.dart';
import '../../../components/ui/toast/toast.dart';
import '../../../constants/theme.dart';
import '../../../l10n/app_localizations.dart';

/// No backend query exists that returns another user's profile by id
/// (`profileGetServerProvider`/`query MyProfile` always resolves from the
/// caller's own session) — so this screen can only ever show what the
/// navigating screen already had in hand (a `Friend` or `UserSearchResult`
/// row), passed through as the route's `extra`. A user reaching this route
/// with no `extra` (e.g. a bare deep link) sees an empty state rather than
/// the previous bug of silently showing the caller's own profile.
class UserDetailPageContent extends ConsumerStatefulWidget {
  final String lang;
  final String userId;
  final Object? extra;

  const UserDetailPageContent({
    super.key,
    required this.lang,
    required this.userId,
    this.extra,
  });

  @override
  ConsumerState<UserDetailPageContent> createState() =>
      _UserDetailPageContentState();
}

class _UserDetailPageContentState extends ConsumerState<UserDetailPageContent> {
  // Same regression class as UserSearchCard/SuggestedFriendsPanel: unawaited
  // send with no loading/failure feedback and no "already sent" state.
  bool _sending = false;
  bool _sent = false;

  Future<void> _handleAdd() async {
    if (_sending) return;
    setState(() => _sending = true);
    try {
      await ref.read(friendActionsProvider).sendRequest(widget.userId);
      if (mounted) setState(() => _sent = true);
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
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);

    final String name;
    final String? email;
    final String? avatarUrl;
    final bool? isOnline;
    final data = widget.extra;
    if (data is Friend) {
      name = data.name;
      email = data.email;
      avatarUrl = null;
      isOnline = data.isOnline;
    } else if (data is UserSearchResult) {
      name = data.name;
      email = null;
      avatarUrl = data.avatarUrl;
      isOnline = null;
    } else {
      return EmptyWidget(
        title: t.usersDetailUnavailable,
        icon: Icons.person_off_outlined,
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Center(
          child: Column(
            children: [
              Avatar(name: name, imageUrl: avatarUrl, radius: 40),
              const SizedBox(height: 12),
              Text(
                name,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (email != null)
                Text(email, style: TextStyle(color: colors.fgMuted)),
              if (isOnline != null) ...[
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isOnline ? colors.success : colors.fgMuted,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isOnline ? t.usersOnline : t.usersOffline,
                      style: TextStyle(color: colors.fgMuted, fontSize: 12),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 24),
              if (_sent)
                Text(
                  t.findFriendsPending,
                  style: TextStyle(color: colors.fgMuted),
                )
              else
                Button(
                  loading: _sending,
                  onPressed: _sending ? null : _handleAdd,
                  child: Text(t.usersAddFriend),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
