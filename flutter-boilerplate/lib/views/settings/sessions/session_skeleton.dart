import 'package:flutter/material.dart';

import '../../../components/ui/skeleton/skeleton.dart';

class SessionSkeleton extends StatelessWidget {
  final int count;

  const SessionSkeleton({super.key, this.count = 3});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: List.generate(count, (i) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Card(
          margin: EdgeInsets.zero,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const SkeletonCircle(radius: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Skeleton(width: 140, height: 16),
                      const SizedBox(height: 6),
                      const Skeleton(width: 200, height: 12),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                const Skeleton(width: 60, height: 28, borderRadius: 999),
              ],
            ),
          ),
        ),
      )),
    );
  }
}
