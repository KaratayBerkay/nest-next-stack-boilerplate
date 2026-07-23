import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/server/push_notifications/subscribe.dart';
import '../api/server/push_notifications/unsubscribe.dart';

final pushNotificationStreamProvider = StreamProvider<RemoteMessage>((ref) {
  final controller = StreamController<RemoteMessage>();
  final sub = FirebaseMessaging.onMessage.listen(controller.add);
  ref.onDispose(() {
    sub.cancel();
    unawaited(controller.close());
  });
  return controller.stream;
});

final fcmTokenProvider = StateProvider<String?>((ref) => null);

final pushNotificationPermissionProvider = StateProvider<NotificationPermission?>((ref) => null);

final pushNotificationActionsProvider = NotifierProvider<PushNotificationActionsNotifier, PushNotificationActionsState>(
  PushNotificationActionsNotifier.new,
);

class PushNotificationActionsState {
  final Set<String> subscribedTopics;
  final bool isLoading;
  final String? error;

  const PushNotificationActionsState({
    this.subscribedTopics = const {},
    this.isLoading = false,
    this.error,
  });
}

class PushNotificationActionsNotifier extends Notifier<PushNotificationActionsState> {
  @override
  PushNotificationActionsState build() => const PushNotificationActionsState();

  Future<void> subscribeToTopic(String topic) async {
    state = PushNotificationActionsState(
      subscribedTopics: state.subscribedTopics,
      isLoading: true,
    );
    try {
      await FirebaseMessaging.instance.subscribeToTopic(topic);
      await ref.read(pushSubscribeServerProvider).call(topic);
      final updated = {...state.subscribedTopics, topic};
      state = PushNotificationActionsState(subscribedTopics: updated);
    } catch (e) {
      state = PushNotificationActionsState(
        subscribedTopics: state.subscribedTopics,
        error: e.toString(),
      );
    }
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    state = PushNotificationActionsState(
      subscribedTopics: state.subscribedTopics,
      isLoading: true,
    );
    try {
      await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
      await ref.read(pushUnsubscribeServerProvider).call(topic);
      final updated = {...state.subscribedTopics}..remove(topic);
      state = PushNotificationActionsState(subscribedTopics: updated);
    } catch (e) {
      state = PushNotificationActionsState(
        subscribedTopics: state.subscribedTopics,
        error: e.toString(),
      );
    }
  }

  void reset() {
    state = const PushNotificationActionsState();
  }
}
