import 'package:flutter/material.dart';

import '../../components/ui/skeleton/skeleton.dart';

class ChatRoomFallback extends StatelessWidget {
  const ChatRoomFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          SkeletonCard(lines: 2),
          SizedBox(height: 16),
          SkeletonCard(lines: 4),
          SizedBox(height: 16),
          SkeletonCard(),
        ],
      ),
    );
  }
}
