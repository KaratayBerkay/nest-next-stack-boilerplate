import 'package:flutter/material.dart';

class ResizablePanel extends StatefulWidget {
  final Widget leftPanel;
  final Widget rightPanel;
  final double initialRatio;
  final double minRatio;
  final double maxRatio;
  final Axis direction;

  const ResizablePanel({
    super.key,
    required this.leftPanel,
    required this.rightPanel,
    this.initialRatio = 0.5,
    this.minRatio = 0.2,
    this.maxRatio = 0.8,
    this.direction = Axis.horizontal,
  });

  @override
  State<ResizablePanel> createState() => _ResizablePanelState();
}

class _ResizablePanelState extends State<ResizablePanel> {
  late double _ratio;

  @override
  void initState() {
    super.initState();
    _ratio = widget.initialRatio;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.direction == Axis.horizontal) {
      return LayoutBuilder(
        builder: (context, constraints) {
          final dividerWidth = 4.0;
          final availableWidth = constraints.maxWidth - dividerWidth;
          return Row(
            children: [
              SizedBox(
                width: availableWidth * _ratio,
                child: widget.leftPanel,
              ),
              MouseRegion(
                cursor: SystemMouseCursors.resizeColumn,
                child: GestureDetector(
                  onPanUpdate: (details) {
                    setState(() {
                      _ratio += details.delta.dx / availableWidth;
                      _ratio = _ratio.clamp(widget.minRatio, widget.maxRatio);
                    });
                  },
                  child: Container(
                    width: dividerWidth,
                    color: Theme.of(context).dividerColor,
                  ),
                ),
              ),
              SizedBox(
                width: availableWidth * (1 - _ratio),
                child: widget.rightPanel,
              ),
            ],
          );
        },
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        return Column(
          children: [
            SizedBox(
              height: constraints.maxHeight * _ratio,
              child: widget.leftPanel,
            ),
            MouseRegion(
              cursor: SystemMouseCursors.resizeRow,
              child: GestureDetector(
                onPanUpdate: (details) {
                  setState(() {
                    _ratio += details.delta.dy / constraints.maxHeight;
                    _ratio = _ratio.clamp(widget.minRatio, widget.maxRatio);
                  });
                },
                child: Container(
                  height: 4,
                  color: Theme.of(context).dividerColor,
                ),
              ),
            ),
            SizedBox(
              height: constraints.maxHeight * (1 - _ratio),
              child: widget.rightPanel,
            ),
          ],
        );
      },
    );
  }
}
