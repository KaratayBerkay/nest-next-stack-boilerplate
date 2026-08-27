import 'package:flutter/material.dart';

import 'free_find_friends_content.dart';

class FreeFindFriendsPage extends StatelessWidget {
  final String lang;

  const FreeFindFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return FreeFindFriendsContent(lang: lang);
  }
}
