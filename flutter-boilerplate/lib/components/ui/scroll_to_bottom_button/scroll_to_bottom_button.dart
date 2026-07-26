import 'package:flutter/material.dart';

class ScrollToBottomButton extends StatelessWidget {
  final ScrollController scrollController;
  final bool visible;
  final VoidCallback? onPressed;

  const ScrollToBottomButton({
    super.key,
    required this.scrollController,
    this.visible = true,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    if (!visible) return const SizedBox.shrink();

    return FloatingActionButton.small(
      onPressed: onPressed ?? () => _settleToBottom(scrollController),
      child: const Icon(Icons.keyboard_arrow_down),
    );
  }
}

/// `maxScrollExtent` is only an estimate until every item between the
/// current viewport and the end has actually been built — `ListView` only
/// lays out items near what's visible. For a long list, a single jump or
/// animation to that estimate undershoots, because scrolling through is
/// what makes Flutter build (and correct the estimate for) the rest. Keep
/// jumping to the newest estimate, one frame at a time, until it stops
/// growing, then finish with one smooth animation.
void _settleToBottom(ScrollController controller, [int attempt = 0]) {
  if (!controller.hasClients) return;
  final before = controller.position.maxScrollExtent;
  controller.jumpTo(before);
  if (attempt >= 8) return;
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!controller.hasClients) return;
    final after = controller.position.maxScrollExtent;
    if (after > before) {
      _settleToBottom(controller, attempt + 1);
    } else {
      controller.animateTo(
        after,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
      );
    }
  });
}
