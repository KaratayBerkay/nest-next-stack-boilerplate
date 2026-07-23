import 'package:flutter/material.dart';

import '../../components/ui/skeleton/skeleton.dart';

class ChatRoomFallback extends StatelessWidget {
  const ChatRoomFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SkeletonCard(lines: 2),
          const SizedBox(height: 16),
          const SkeletonCard(lines: 4),
          const SizedBox(height: 16),
          const SkeletonCard(lines: 3),
        ],
      ),
    );
  }
}
