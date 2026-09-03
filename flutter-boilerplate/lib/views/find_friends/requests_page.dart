import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';
import '../../api/client/friends/query.dart';
import '../../components/ui/avatar/avatar.dart';
import '../../components/ui/empty/empty.dart';
import '../../components/ui/toast/toast.dart';
import '../../constants/theme.dart';
import '../../l10n/app_localizations.dart';

class FindFriendsRequestsPage extends StatelessWidget {
  final String lang;

  const FindFriendsRequestsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    // Backend has no tier gate on friend-request handling (users(search) and
    // every friend-request REST handler carry none) — every tier gets the
    // real requests view, not an upgrade wall.
    return _RequestsView();
  }
}

enum _PendingAction { accept, decline }

class _RequestsView extends ConsumerStatefulWidget {
  @override
  ConsumerState<_RequestsView> createState() => _RequestsViewState();
}

class _RequestsViewState extends ConsumerState<_RequestsView> {
  // Regression: accept/decline previously sent the friend-request's own id
  // instead of the sender's user id (the backend's `:userId` route param),
  // so every tap 404'd — and the failure was swallowed with no busy state
  // or feedback, so the button just looked dead. Mirrors the fix in
  // PendingRequestCard.
  final Map<String, _PendingAction> _pending = {};

  Future<void> _respond(
    String requestId,
    String userId,
    _PendingAction action,
  ) async {
    if (_pending.containsKey(requestId)) return;
    setState(() => _pending[requestId] = action);
    try {
      final actions = ref.read(friendActionsProvider);
      if (action == _PendingAction.accept) {
        await actions.acceptRequest(userId);
      } else {
        await actions.declineRequest(userId);
      }
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
      if (mounted) setState(() => _pending.remove(requestId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final t = AppLocalizations.of(context);
    final requestsAsync = ref.watch(friendRequestsProvider);

    return requestsAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text(t.findFriendsFailedToLoadRequests)),
      data: (requests) {
        if (requests.isEmpty) {
          return EmptyWidget(
            title: t.findFriendsNoRequests,
            icon: Icons.person_add_disabled,
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: requests.length,
          itemBuilder: (_, i) {
            final req = requests[i];
            final busy = _pending.containsKey(req.id);
            final action = _pending[req.id];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Avatar(name: req.fromUserName),
                title: Text(req.fromUserName),
                subtitle: Text(
                  'Sent ${_timeAgo(req.createdAt)}',
                  style: TextStyle(color: colors.fgMuted, fontSize: 12),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (req.isIncoming)
                      IconButton(
                        icon: action == _PendingAction.accept
                            ? SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: colors.success,
                                ),
                              )
                            : Icon(Icons.check_circle, color: colors.success),
                        onPressed: busy
                            ? null
                            : () => _respond(
                                  req.id,
                                  req.fromUserId,
                                  _PendingAction.accept,
                                ),
                      ),
                    IconButton(
                      icon: action == _PendingAction.decline
                          ? SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: colors.danger,
                              ),
                            )
                          : Icon(Icons.cancel, color: colors.danger),
                      onPressed: busy
                          ? null
                          : () => _respond(
                                req.id,
                                req.fromUserId,
                                _PendingAction.decline,
                              ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  String _timeAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
