import 'package:flutter/material.dart';

import '../../components/ui/skeleton/skeleton.dart';

class NotificationFallback extends StatelessWidget {
  const NotificationFallback({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: List.generate(6, (_) => const Padding(
          padding: EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              SkeletonCircle(radius: 16),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Skeleton(width: 200, height: 14),
                    SizedBox(height: 4),
                    Skeleton(width: 250, height: 12),
                  ],
                ),
              ),
            ],
          ),
        )),
      ),
    );
  }
}
