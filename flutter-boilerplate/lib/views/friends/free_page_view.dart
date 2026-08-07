import 'package:flutter/material.dart';

import 'friends_page_content.dart';

class FreeFriendsPage extends StatelessWidget {
  final String lang;

  const FreeFriendsPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) => FriendsPageContent(lang: lang);
}
