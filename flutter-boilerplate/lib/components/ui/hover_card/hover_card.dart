import 'package:flutter/material.dart';

class HoverCard extends StatefulWidget {
  final Widget child;
  final Widget content;
  final double? width;
  final double? height;

  const HoverCard({
    super.key,
    required this.child,
    required this.content,
    this.width,
    this.height,
  });

  @override
  State<HoverCard> createState() => _HoverCardState();
}

class _HoverCardState extends State<HoverCard> {
  final OverlayPortalController _controller = OverlayPortalController();
  final LayerLink _layerLink = LayerLink();

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: OverlayPortal(
        controller: _controller,
        overlayChildBuilder: (_) {
          return CompositedTransformFollower(
            link: _layerLink,
            offset: const Offset(0, 8),
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: widget.width ?? 200,
                height: widget.height,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: widget.content,
              ),
            ),
          );
        },
        child: MouseRegion(
          onEnter: (_) => _controller.show(),
          onExit: (_) => _controller.hide(),
          child: GestureDetector(
            onLongPress: () => _controller.toggle(),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}
