import 'package:flutter/material.dart';

String formatNotificationType(String type) {
  return type
      .split(RegExp(r'[_-]'))
      .map((word) => word.isNotEmpty
          ? '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}'
          : '',)
      .join(' ');
}

IconData getNotificationIcon(String type) {
  switch (type) {
    case 'like':
    case 'favorite':
    case 'heart':
      return Icons.favorite;
    case 'comment':
    case 'reply':
      return Icons.chat_bubble_outline;
    case 'follow':
    case 'friend_request':
      return Icons.person_add_outlined;
    case 'mention':
      return Icons.alternate_email;
    case 'share':
      return Icons.share_outlined;
    case 'system':
    case 'announcement':
      return Icons.campaign_outlined;
    case 'warning':
    case 'alert':
      return Icons.warning_amber_outlined;
    case 'payment':
    case 'billing':
      return Icons.receipt_outlined;
    default:
      return Icons.notifications_outlined;
  }
}

List<T> filterByType<T>(List<T> items, String type) {
  if (type == 'all') return items;
  return items;
}
