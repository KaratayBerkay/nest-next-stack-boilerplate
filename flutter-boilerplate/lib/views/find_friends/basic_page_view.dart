import 'package:flutter/material.dart';

import '../../components/ui/empty/empty.dart';

class BasicFindFriendsPage extends StatelessWidget {
  final String lang;

  const BasicFindFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return const EmptyWidget(
      title: 'Basic Find Friends',
      description: 'Your basic find friends experience.',
      icon: Icons.people_outline,
    );
  }
}
