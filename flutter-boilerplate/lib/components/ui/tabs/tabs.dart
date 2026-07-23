import 'package:flutter/material.dart';

class TabsWidget extends StatefulWidget {
  final List<Tab> tabs;
  final List<Widget> children;
  final TabController? controller;

  const TabsWidget({
    super.key,
    required this.tabs,
    required this.children,
    this.controller,
  });

  @override
  State<TabsWidget> createState() => _TabsWidgetState();
}

class _TabsWidgetState extends State<TabsWidget> with SingleTickerProviderStateMixin {
  late TabController _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ??
        TabController(length: widget.tabs.length, vsync: this);
  }

  @override
  void dispose() {
    if (widget.controller == null) _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          controller: _controller,
          tabs: widget.tabs,
        ),
        Expanded(
          child: TabBarView(
            controller: _controller,
            children: widget.children,
          ),
        ),
      ],
    );
  }
}

class TabsList extends StatelessWidget {
  final List<Widget> tabs;
  final TabController? controller;

  const TabsList({super.key, required this.tabs, this.controller});

  @override
  Widget build(BuildContext context) {
    return TabBar(controller: controller, tabs: tabs);
  }
}

class TabsContent extends StatelessWidget {
  final List<Widget> children;
  final TabController? controller;

  const TabsContent({super.key, required this.children, this.controller});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: TabBarView(controller: controller, children: children),
    );
  }
}
