import 'package:flutter/material.dart';

import '../../components/ui/skeleton/skeleton.dart';

class MessagesViewFallback extends StatelessWidget {
  const MessagesViewFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 280,
          child: ListView.builder(
            itemCount: 8,
            itemBuilder: (_, __) => const Padding(
              padding: EdgeInsets.all(12),
              child: Row(
                children: [
                  SkeletonCircle(),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Skeleton(width: 120, height: 14),
                        SizedBox(height: 4),
                        Skeleton(width: 180, height: 12),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const Expanded(
          child: Center(child: CircularProgressIndicator()),
        ),
      ],
    );
  }
}
