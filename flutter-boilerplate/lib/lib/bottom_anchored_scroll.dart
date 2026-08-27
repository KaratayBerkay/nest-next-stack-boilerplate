import 'package:flutter/material.dart';

/// Bottom-anchored chat scrolling — the Flutter twin of web's `useAutoScroll`
/// hook, shared by the DM chat view and the chat-room view instead of each
/// keeping a verbatim copy of the controller wiring and the settle loop.
///
/// Owns a [scrollController] plus an [isAtBottom] flag (updated with
/// `setState` so scroll-to-bottom affordances can react), and exposes
/// [scrollToBottom].
mixin BottomAnchoredScroll<T extends StatefulWidget> on State<T> {
  final ScrollController scrollController = ScrollController();
  bool isAtBottom = true;

  @override
  void initState() {
    super.initState();
    scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    scrollController.removeListener(_onScroll);
    scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    final maxScroll = scrollController.position.maxScrollExtent;
    final currentScroll = scrollController.position.pixels;
    final atBottom = (maxScroll - currentScroll) < 50;
    if (atBottom != isAtBottom) {
      setState(() => isAtBottom = atBottom);
    }
  }

  void scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) => _settleToBottom());
  }

  /// `maxScrollExtent` is only an estimate until every item between the
  /// current viewport and the end has actually been built — `ListView`
  /// only lays out items near what's visible. For a long conversation, a
  /// single jump/animate to that estimate undershoots, because scrolling
  /// through is what makes Flutter build (and correct the estimate for)
  /// the rest. Keep jumping to the newest estimate, one frame at a time,
  /// until it stops growing, then finish with one smooth animation.
  void _settleToBottom([int attempt = 0]) {
    if (!scrollController.hasClients) return;
    final before = scrollController.position.maxScrollExtent;
    scrollController.jumpTo(before);
    if (attempt >= 8) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!scrollController.hasClients) return;
      final after = scrollController.position.maxScrollExtent;
      if (after > before) {
        _settleToBottom(attempt + 1);
      } else {
        scrollController.animateTo(
          after,
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
        );
      }
    });
  }
}
