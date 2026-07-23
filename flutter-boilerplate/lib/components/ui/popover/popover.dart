import 'package:flutter/material.dart';

class PopoverWidget extends StatefulWidget {
  final Widget child;
  final Widget Function(BuildContext) popoverBuilder;
  final PopoverPosition position;

  const PopoverWidget({
    super.key,
    required this.child,
    required this.popoverBuilder,
    this.position = PopoverPosition.bottom,
  });

  @override
  State<PopoverWidget> createState() => _PopoverWidgetState();
}

enum PopoverPosition { top, bottom, left, right }

class _PopoverWidgetState extends State<PopoverWidget> {
  final _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;

  void _showOverlay() {
    _overlayEntry = OverlayEntry(
      builder: (_) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: _dismiss,
              child: Container(color: Colors.transparent),
            ),
          ),
          CompositedTransformFollower(
            link: _layerLink,
            offset: _offset,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(8),
              child: widget.popoverBuilder(context),
            ),
          ),
        ],
      ),
    );
    Overlay.of(context).insert(_overlayEntry!);
  }

  Offset get _offset {
    switch (widget.position) {
      case PopoverPosition.bottom:
        return const Offset(0, 8);
      case PopoverPosition.top:
        return const Offset(0, -8);
      case PopoverPosition.left:
        return const Offset(-8, 0);
      case PopoverPosition.right:
        return const Offset(8, 0);
    }
  }

  void _dismiss() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  @override
  void dispose() {
    _dismiss();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: InkWell(
        onTap: _showOverlay,
        child: widget.child,
      ),
    );
  }
}

class PopoverContent extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;

  const PopoverContent({super.key, required this.child, this.padding});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsets.all(8),
      child: child,
    );
  }
}

class PopoverTrigger extends StatelessWidget {
  final Widget child;

  const PopoverTrigger({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return child;
  }
}
