import 'package:flutter/material.dart';

import 'free_page_view.dart';

class BasicFeedPage extends StatelessWidget {
  final String lang;
  const BasicFeedPage({super.key, required this.lang});

  @override
  Widget build(BuildContext context) {
    return FreeFeedPage(lang: lang);
  }
}
