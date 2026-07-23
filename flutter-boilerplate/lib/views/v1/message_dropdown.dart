import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MessageDropdown extends StatelessWidget {
  final String lang;
  final int unreadCount;

  const MessageDropdown({
    super.key,
    required this.lang,
    this.unreadCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          icon: const Icon(Icons.message_outlined),
          tooltip: 'Messages',
          onPressed: () => context.go('/v1/$lang/messages'),
        ),
        if (unreadCount > 0)
          Positioned(
            right: 4,
            top: 4,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
              child: Text(
                unreadCount > 99 ? '99+' : '$unreadCount',
                style: const TextStyle(color: Colors.white, fontSize: 10),
              ),
            ),
          ),
      ],
    );
  }
}
