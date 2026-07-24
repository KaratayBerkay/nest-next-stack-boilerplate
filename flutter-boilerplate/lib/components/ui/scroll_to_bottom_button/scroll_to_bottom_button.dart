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
      onPressed: onPressed ??
          () {
            if (scrollController.hasClients) {
              scrollController.animateTo(
                scrollController.position.maxScrollExtent,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOut,
              );
            }
          },
      child: const Icon(Icons.keyboard_arrow_down),
    );
  }
}
