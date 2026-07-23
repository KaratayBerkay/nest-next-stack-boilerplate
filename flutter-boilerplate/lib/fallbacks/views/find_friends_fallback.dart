import 'package:flutter/material.dart';

import '../../components/ui/skeleton/skeleton.dart';

class FindFriendsFallback extends StatelessWidget {
  const FindFriendsFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Skeleton(width: double.infinity, height: 40),
          const SizedBox(height: 16),
          ...List.generate(5, (_) => const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: SkeletonCard(lines: 2),
          )),
        ],
      ),
    );
  }
}
