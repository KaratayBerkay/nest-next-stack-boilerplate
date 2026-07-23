import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../lib/api_client.dart';
import '../hooks/use_auth.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  final notification = message.notification;
  if (notification == null) return;
  await _showLocalNotification(message);
}

FlutterLocalNotificationsPlugin _sharedPlugin = FlutterLocalNotificationsPlugin();

Future<void> _showLocalNotification(RemoteMessage message) async {
  final notification = message.notification;
  if (notification == null) return;

  final androidDetails = AndroidNotificationDetails(
    'default_channel',
    'Notifications',
    channelDescription: 'General notifications',
    importance: Importance.high,
    priority: Priority.high,
  );
  final iosDetails = DarwinNotificationDetails(
    presentAlert: true,
    presentBadge: true,
    presentSound: true,
  );
  await _sharedPlugin.show(
    id: notification.hashCode,
    title: notification.title,
    body: notification.body,
    notificationDetails: NotificationDetails(android: androidDetails, iOS: iosDetails),
    payload: jsonEncode(message.data),
  );
}

final pushNotificationProvider = Provider<PushNotificationService>((ref) {
  final service = PushNotificationService(ref: ref);
  ref.onDispose(() => service.dispose());
  return service;
});

class PushNotificationService {
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();

  final Ref? ref;
  bool _initialized = false;

  PushNotificationService({this.ref});

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _localNotifications.initialize(
      settings: const InitializationSettings(android: androidSettings, iOS: iosSettings),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    final messaging = FirebaseMessaging.instance;

    await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    final token = await messaging.getToken();
    if (token != null) {
      _registerToken(token);
    }

    messaging.onTokenRefresh.listen((t) => _registerToken(t));
    FirebaseMessaging.onMessage.listen(_onForegroundMessage);

    final initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null) {
      handleNavigation(initialMessage);
    }

    FirebaseMessaging.onMessageOpenedApp.listen(handleNavigation);
  }

  Future<void> _onForegroundMessage(RemoteMessage message) async {
    final notification = message.notification;
    if (notification == null) return;

    final androidDetails = AndroidNotificationDetails(
      'default_channel',
      'Notifications',
      channelDescription: 'General notifications',
      importance: Importance.high,
      priority: Priority.high,
    );
    final iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    await _localNotifications.show(
      id: notification.hashCode,
      title: notification.title,
      body: notification.body,
      notificationDetails: NotificationDetails(android: androidDetails, iOS: iosDetails),
      payload: jsonEncode(message.data),
    );
  }

  void _onNotificationTap(NotificationResponse response) {
    final payload = response.payload;
    if (payload == null) return;
    try {
      final data = jsonDecode(payload) as Map<String, dynamic>;
      navigateFromData(data);
    } catch (_) {}
  }

  void handleNavigation(RemoteMessage message) {
    navigateFromData(message.data);
  }

  void navigateFromData(Map<String, dynamic> data) {
    final type = data['type'] as String?;
    final conversationId = data['conversationId'] as String?;
    final lang = data['lang'] as String? ?? 'en';

    if (type == 'chat' && conversationId != null) {
      navigateTo?.call('/v1/$lang/chat/$conversationId');
    } else if (type == 'post') {
      final postId = data['postId'] as String?;
      if (postId != null) navigateTo?.call('/v1/$lang/posts/$postId');
    } else if (type == 'notification') {
      navigateTo?.call('/v1/$lang/notification');
    } else if (type == 'feed_update') {
      navigateTo?.call('/v1/$lang/feed');
    }
  }

  void Function(String path)? navigateTo;

  Future<void> _registerToken(String token) async {
    if (ref == null) return;
    try {
      final user = ref!.read(currentUserProvider);
      if (user != null) {
        final dio = ref!.read(dioProvider);
        await dio.post<dynamic>('/api/push-notifications/register', data: {
          'token': token,
          'platform': Platform.isIOS ? 'ios' : 'android',
        });
      }
    } catch (_) {}
  }

  void dispose() {
    _initialized = false;
  }
}
