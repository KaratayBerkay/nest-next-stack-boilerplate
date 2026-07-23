import 'package:flutter/material.dart';

import '../../../components/ui/skeleton/skeleton.dart';

class SessionSkeleton extends StatelessWidget {
  final int count;

  const SessionSkeleton({super.key, this.count = 3});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: List.generate(count, (i) => const Padding(
        padding: EdgeInsets.only(bottom: 8),
        child: Card(
          margin: EdgeInsets.zero,
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                SkeletonCircle(),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Skeleton(width: 140),
                      SizedBox(height: 6),
                      Skeleton(width: 200, height: 12),
                    ],
                  ),
                ),
                SizedBox(width: 8),
                Skeleton(width: 60, height: 28, borderRadius: 999),
              ],
            ),
          ),
        ),
      ),),
    );
  }
}
