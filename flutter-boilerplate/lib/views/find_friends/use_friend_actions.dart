import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/client/friends/actions.dart';

enum FriendActionStatus { idle, loading, success, error }

class FriendActionState {
  final FriendActionStatus status;
  final String? errorMessage;
  final String? lastActionedUserId;

  const FriendActionState({
    this.status = FriendActionStatus.idle,
    this.errorMessage,
    this.lastActionedUserId,
  });
}

class FriendActionNotifier extends Notifier<FriendActionState> {
  @override
  FriendActionState build() => const FriendActionState();

  Future<void> sendRequest(String userId) async {
    state = FriendActionState(status: FriendActionStatus.loading, lastActionedUserId: userId);
    try {
      await ref.read(friendActionsProvider).sendRequest(userId);
      state = const FriendActionState(status: FriendActionStatus.success);
    } catch (e) {
      state = FriendActionState(
        status: FriendActionStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> acceptRequest(String requestId) async {
    state = const FriendActionState(status: FriendActionStatus.loading);
    try {
      await ref.read(friendActionsProvider).acceptRequest(requestId);
      state = const FriendActionState(status: FriendActionStatus.success);
    } catch (e) {
      state = FriendActionState(
        status: FriendActionStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> declineRequest(String requestId) async {
    state = const FriendActionState(status: FriendActionStatus.loading);
    try {
      await ref.read(friendActionsProvider).declineRequest(requestId);
      state = const FriendActionState(status: FriendActionStatus.success);
    } catch (e) {
      state = FriendActionState(
        status: FriendActionStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  void reset() {
    state = const FriendActionState();
  }
}

final friendActionStateProvider = NotifierProvider<FriendActionNotifier, FriendActionState>(
  FriendActionNotifier.new,
);
