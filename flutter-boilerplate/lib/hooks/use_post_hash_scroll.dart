import 'package:flutter/material.dart';

class PostHashScrollController {
  final ScrollController scrollController = ScrollController();
  final GlobalKey scrollKey = GlobalKey();

  void scrollToAnchor() {
    final context = scrollKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 300),
        alignment: 0.1,
      );
    }
  }

  void dispose() {
    scrollController.dispose();
  }
}
