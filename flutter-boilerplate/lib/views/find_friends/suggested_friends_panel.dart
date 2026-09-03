import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';
import '../../api/server/friends/suggested.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/spinner/spinner.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class SuggestedFriendsPanel extends ConsumerStatefulWidget {
  final AsyncValue<List<SuggestedUser>> suggestedAsync;
  final String lang;

  const SuggestedFriendsPanel({
    super.key,
    required this.suggestedAsync,
    required this.lang,
  });

  @override
  ConsumerState<SuggestedFriendsPanel> createState() =>
      _SuggestedFriendsPanelState();
}

class _SuggestedFriendsPanelState extends ConsumerState<SuggestedFriendsPanel> {
  // Same regression class as UserSearchCard: unawaited send with no
  // loading/failure feedback and no "already sent" state.
  final Set<String> _sendingIds = {};
  final Set<String> _sentIds = {};

  Future<void> _handleAdd(String userId) async {
    if (_sendingIds.contains(userId)) return;
    setState(() => _sendingIds.add(userId));
    try {
      await ref.read(friendActionsProvider).sendRequest(userId);
      if (mounted) setState(() => _sentIds.add(userId));
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
      if (mounted) setState(() => _sendingIds.remove(userId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    return widget.suggestedAsync.when(
      loading: () => const Spinner(),
      error: (err, _) => EmptyWidget(
        title: t.findFriendsFailedToLoadSuggestions,
        description: err.toString(),
        icon: Icons.error_outline,
      ),
      data: (users) {
        if (users.isEmpty) {
          return EmptyWidget(
            title: t.findFriendsNoSuggestions,
            description: 'Follow more people to get suggestions.',
            icon: Icons.people_outline,
          );
        }
        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: users.length,
          itemBuilder: (_, i) {
            final userId = users[i].id;
            final sending = _sendingIds.contains(userId);
            final sent = _sentIds.contains(userId);
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Avatar(
                  name: users[i].name,
                  imageUrl: users[i].avatarUrl,
                ),
                title: Text(users[i].name),
                subtitle: Text(
                  '${users[i].mutualFriends} mutual friends',
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
                trailing: sent
                    ? Text(
                        t.findFriendsPending,
                        style: Theme.of(context).textTheme.bodySmall,
                      )
                    : FilledButton.tonal(
                        onPressed: sending ? null : () => _handleAdd(userId),
                        child: sending
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(t.findFriendsAddFriend),
                      ),
              ),
            );
          },
        );
      },
    );
  }
}
